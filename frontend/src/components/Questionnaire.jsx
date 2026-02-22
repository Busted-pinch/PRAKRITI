import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from './Layout';
import {
    IntroStep,
    LikertStep,
    DiseaseStep,
    InterestStep,
    HobbyStep,
    ConstraintStep,
    CompletionStep
} from './QuestionnaireSteps';
import { useTheme } from '../context/ThemeContext';

// Steps: Intro (0), Likert (1), Diseases (2), Interests (3), Hobbies (4), Constraints (5) -> Completion (6)

const Questionnaire = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);

    // State matching the required backend payload
    const [formData, setFormData] = useState({
        answers: Array(10).fill(null), // 10 Likert questions
        diseases: [],
        selected_interests: [],
        hobbies: [],
        constraints: {
            max_physical_intensity: '',
            aqi_sensitivity: ''
        }
    });

    const handleNext = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (step < 5) {
            setDirection(1);
            setStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (step > 0) {
            setDirection(-1);
            setStep(prev => prev - 1);
        }
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        // Construct final payload exactly as requested
        const payload = {
            answers: formData.answers,
            diseases: formData.diseases.length === 0 ? [] : formData.diseases,
            selected_interests: formData.selected_interests,
            hobbies: formData.hobbies,
            constraints: {
                max_physical_intensity: formData.constraints.max_physical_intensity || 'med',
                aqi_sensitivity: formData.constraints.aqi_sensitivity || 'med'
            }
        };

        console.log("FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

        try {
            // Send to backend
            await api.post('/user/onboarding', payload);

            // Show completion animation
            setStep(6);

            // Navigate to dashboard with payload after delay
            setTimeout(() => {
                navigate('/dashboard', { state: { submission: payload } });
            }, 2000);
        } catch (error) {
            console.error("Failed to submit assessment:", error);
            // Optionally handle error UI here
            alert("Failed to save assessment. Please try again.");
        }
    };


    const steps = [
        <IntroStep onNext={handleNext} />,
        <LikertStep
            data={formData.answers}
            update={(val) => updateFormData('answers', val)}
            onNext={handleNext}
            onBack={handleBack}
        />,
        <DiseaseStep
            data={formData.diseases}
            update={(val) => updateFormData('diseases', val)}
            onNext={handleNext}
            onBack={handleBack}
        />,
        <InterestStep
            data={formData.selected_interests}
            update={(val) => updateFormData('selected_interests', val)}
            onNext={handleNext}
            onBack={handleBack}
        />,
        <HobbyStep
            data={formData.hobbies}
            update={(val) => updateFormData('hobbies', val)}
            onNext={handleNext}
            onBack={handleBack}
        />,
        <ConstraintStep
            data={formData.constraints}
            update={(val) => updateFormData('constraints', val)}
            onNext={handleNext}
            onBack={handleBack}
        />,
        <CompletionStep />
    ];

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
            scale: 0.95,
            filter: "blur(10px)"
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            filter: "blur(0px)"
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            scale: 0.95,
            filter: "blur(10px)"
        }),
    };

    return (
        <Layout>
            <div className="relative flex flex-col items-center justify-center min-h-[85vh] w-full">
                <div className="w-full max-w-5xl mx-auto mt-12 md:mt-16">
                    {/* Progress Bar (visible only on inner steps and not completion) */}
                    {step > 0 && step < 6 && (
                        <div className="mb-8 w-full max-w-md mx-auto">
                            <div className="flex justify-between text-xs font-medium uppercase tracking-widest opacity-60 mb-2">
                                <span>{t('assessment', 'progress')}</span>
                                <span>{Math.round((step / 6) * 100)}%</span>
                            </div>
                            <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-white/30'
                                }`}>
                                <motion.div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(step / 6) * 100}%` }}
                                    transition={{ duration: 0.5, ease: "circOut" }}
                                />
                            </div>
                        </div>
                    )}

                    <AnimatePresence mode='wait' custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.3 },
                                scale: { duration: 0.3 },
                                filter: { duration: 0.3 }
                            }}
                            className="w-full flex justify-center"
                        >
                            {steps[step]}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </Layout>
    );
};

export default Questionnaire;
