import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Background3D from './Background3D';
import {
    IntroStep,
    LikertStep,
    DiseaseStep,
    InterestStep,
    HobbyStep,
    ConstraintStep,
    CompletionStep
} from './QuestionnaireSteps';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TOTAL_STEPS = 6; // Intro, Likert, Diseases, Interests, Hobbies, Constraints

const Questionnaire = () => {
    const { isDarkMode } = useTheme();
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
        if (step < TOTAL_STEPS) {
            setDirection(1);
            setStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
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
            constraints: formData.constraints
        };

        console.log("FINAL PAYLOAD:", JSON.stringify(payload, null, 2));
        // Here you would typically send to backend
        // await submitToBackend(payload);
        setStep(prev => prev + 1); // Go to completion
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 3000);
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
            x: direction > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
        }),
    };

    return (
        <div className={`relative min-h-screen w-full overflow-hidden font-sans transition-colors duration-500 ${isDarkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-white'
            }`}>
            <Background3D />

            {/* Light Mode Gradient Overlay */}
            {!isDarkMode && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-sky-50 -z-10" />
            )}

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-12">
                <div className="w-full max-w-4xl mx-auto">
                    {/* Progress Bar (visible only on inner steps) */}
                    {step > 0 && step < steps.length - 1 && (
                        <div className={`mb-8 w-full max-w-md mx-auto h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                            }`}>
                            <motion.div
                                className="h-full bg-emerald-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${(step / (TOTAL_STEPS)) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
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
                                opacity: { duration: 0.2 }
                            }}
                            className="w-full"
                        >
                            {steps[step]}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Questionnaire;
