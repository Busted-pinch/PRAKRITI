import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, ArrowRight, Activity, Heart, Brain, Bone, Leaf, Search, Wind } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../context/ThemeContext';

const cn = (...inputs) => twMerge(clsx(inputs));

// --- Taxonomy Data --- (Unchanged)
const TAXONOMY = {
    diseases: [
        { category: 'Respiratory', items: ['asthma', 'copd', 'chronic bronchitis', 'allergic rhinitis'], icon: <Activity className="w-4 h-4" /> },
        { category: 'Cardiovascular', items: ['hypertension', 'heart disease', 'arrhythmia'], icon: <Heart className="w-4 h-4" /> },
        { category: 'Metabolic', items: ['diabetes', 'thyroid disorders', 'obesity'], icon: <Activity className="w-4 h-4" /> },
        { category: 'Neurological / Mental', items: ['anxiety disorder', 'depression', 'adhd', 'migraine'], icon: <Brain className="w-4 h-4" /> },
        { category: 'Musculoskeletal', items: ['arthritis', 'chronic back pain'], icon: <Bone className="w-4 h-4" /> },
        { category: 'Autoimmune', items: ['lupus', 'rheumatoid arthritis'], icon: <Leaf className="w-4 h-4" /> },
        { category: 'None', items: ['none'], icon: <Check className="w-4 h-4" /> },
    ],
    interests: [
        { category: 'Intellectual', items: ['science', 'philosophy', 'economics', 'psychology', 'technology', 'research'] },
        { category: 'Creative', items: ['visual arts', 'literature', 'music', 'film & media', 'design'] },
        { category: 'Physical', items: ['sports', 'fitness', 'outdoor adventure'] },
        { category: 'Environmental', items: ['climate awareness', 'conservation', 'sustainability'] },
        { category: 'Social', items: ['community engagement', 'public discourse', 'networking'] },
        { category: 'Digital', items: ['gaming', 'software development', 'simulation systems'] },
        { category: 'Wellness', items: ['mindfulness', 'nutrition', 'longevity'] },
        { category: 'Professional', items: ['entrepreneurship', 'finance', 'leadership', 'productivity'] },
    ],
    hobbies: [
        { category: 'Intellectual', items: ['reading research papers', 'building science projects', 'learning new programming languages'] },
        { category: 'Creative', items: ['creative writing', 'music production', 'painting', 'video editing'] },
        { category: 'Physical', items: ['running', 'cycling', 'weightlifting', 'martial arts', 'trekking'] },
        { category: 'Environmental', items: ['urban gardening', 'tree plantation', 'wildlife volunteering'] },
        { category: 'Social', items: ['public speaking', 'community volunteering', 'event organizing'] },
        { category: 'Digital', items: ['strategy gaming', 'competitive gaming', 'app development', 'game development'] },
        { category: 'Wellness', items: ['meditation practice', 'yoga sessions', 'meal planning'] },
        { category: 'Professional', items: ['startup building', 'stock investing', 'leadership workshops'] },
    ]
};

const LIKERT_QUESTIONS = [
    "I prefer working alone rather than in groups.",
    "I enjoy solving abstract or theoretical problems.",
    "I plan activities in advance rather than acting spontaneously.",
    "I enjoy high-intensity physical activities.",
    "I feel energized after social interaction.",
    "I prefer structured routines over flexible schedules.",
    "I am comfortable taking calculated risks.",
    "I prefer indoor environments over outdoor settings.",
    "I enjoy learning and understanding complex systems.",
    "I value creativity over efficiency when solving problems."
];

// --- Shared UI Components ---
// --- Shared UI Components ---
import GlassCard from './GlassCard';

const Title = ({ children, isDarkMode }) => (
    <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode
        ? 'text-white'
        : 'text-gray-900'
        }`}>
        {children}
    </h2>
);

const Subtitle = ({ children, isDarkMode }) => (
    <p className={`mb-10 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
        {children}
    </p>
);

const StepContainer = ({ children, className, isDarkMode }) => (
    <GlassCard className={cn("w-full max-w-5xl mx-auto p-8 md:p-12 transition-all duration-500", className)}>
        {children}
    </GlassCard>
);

const Button = ({ onClick, disabled, children, className, isDarkMode, variant = 'primary' }) => {
    const baseStyles = "px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-lg active:scale-95";

    const variants = {
        primary: disabled
            ? (isDarkMode ? "bg-gray-800 text-gray-600 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed")
            : (isDarkMode
                ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 hover:scale-[1.02]"
            ),
        outline: disabled
            ? "border border-gray-700 text-gray-700 cursor-not-allowed"
            : (isDarkMode
                ? "border border-white/20 hover:bg-white/10 text-white hover:border-white/40"
                : "border border-gray-300 hover:bg-gray-50 text-gray-700 hover:border-emerald-500/50"
            )
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(baseStyles, variants[variant], className)}
        >
            {children}
        </button>
    );
};

// --- Steps ---

export const IntroStep = ({ onNext }) => {
    const { isDarkMode } = useTheme();
    return (
        <div className="flex flex-col items-center justify-center text-center h-[80vh] space-y-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-4xl mx-auto"
            >
                <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold text-sm tracking-widest uppercase mb-6 border border-emerald-500/20">
                    Prakriti Assessment
                </div>
                <h1 className={`text-6xl md:text-8xl font-bold tracking-tight mb-8 ${isDarkMode
                    ? 'text-white'
                    : 'text-gray-900'
                    }`}>
                    Discover Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Nature Persona</span>
                </h1>
                <p className={`text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Uncover the deep connection between your cognitive style, physical energy, and the environment.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                <Button onClick={onNext} isDarkMode={isDarkMode} className="text-lg px-12 py-5 shadow-2xl shadow-emerald-500/30">
                    Begin Journey <ArrowRight className="w-6 h-6" />
                </Button>
                <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Takes approximately 2 minutes
                </div>
            </motion.div>
        </div>
    );
};

export const LikertStep = ({ data, update, onNext, onBack }) => {
    const { isDarkMode } = useTheme();

    const isComplete = data.every(val => val !== null);

    const handleSelect = (qIndex, val) => {
        const newData = [...data];
        newData[qIndex] = val;
        update(newData);
    };

    return (
        <StepContainer isDarkMode={isDarkMode} className="text-center">
            <Title isDarkMode={isDarkMode}>Code Your Personality</Title>
            <Subtitle isDarkMode={isDarkMode}>Rate how strongly you agree with each statement.</Subtitle>

            <div className="space-y-8 mb-12 text-left">
                {LIKERT_QUESTIONS.map((question, qIndex) => (
                    <div key={qIndex} className="space-y-4">
                        <div className={`flex justify-between items-end ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            <span className="text-lg font-medium">{qIndex + 1}. {question}</span>
                            {data[qIndex] && (
                                <span className="text-emerald-500 font-bold text-sm bg-emerald-500/10 px-2 py-1 rounded">
                                    {data[qIndex]}/5
                                </span>
                            )}
                        </div>

                        <div className={`relative h-14 rounded-2xl flex items-center justify-between px-2 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                            {/* Track Line */}
                            <div className="absolute left-6 right-6 h-0.5 bg-gray-300 dark:bg-gray-700 z-0" />

                            {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleSelect(qIndex, val)}
                                    className={cn(
                                        "relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                                        data[qIndex] === val
                                            ? "bg-emerald-500 text-white border-emerald-500 scale-110 shadow-lg shadow-emerald-500/40 font-bold"
                                            : (data[qIndex] > val
                                                ? "bg-emerald-500 text-white border-emerald-500 scale-90"
                                                : (isDarkMode
                                                    ? "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500"
                                                    : "bg-white text-gray-400 border-gray-300 hover:border-gray-400")
                                            )
                                    )}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs uppercase tracking-wider font-semibold opacity-50 px-2">
                            <span>Strongly Disagree</span>
                            <span>Strongly Agree</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={`flex justify-between items-center mt-12 pt-8 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <Button variant="outline" onClick={onBack} isDarkMode={isDarkMode}>Back</Button>
                <Button onClick={onNext} disabled={!isComplete} isDarkMode={isDarkMode}>
                    Next Step <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </StepContainer>
    );
};

export const DiseaseStep = ({ data, update, onNext, onBack }) => {
    const { isDarkMode } = useTheme();

    const toggleSelection = (item) => {
        let newData;
        if (item === 'none') {
            newData = data.includes('none') ? [] : ['none'];
        } else {
            let temp = data.filter(d => d !== 'none');
            if (temp.includes(item)) {
                newData = temp.filter(d => d !== item);
            } else {
                newData = [...temp, item];
            }
        }
        update(newData);
    };

    return (
        <StepContainer isDarkMode={isDarkMode}>
            <Title isDarkMode={isDarkMode}>Health Profile</Title>
            <Subtitle isDarkMode={isDarkMode}>Select any diagnosed conditions. Your privacy is paramount.</Subtitle>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
                {TAXONOMY.diseases.map((group, idx) => (
                    <GlassCard key={idx} className={`p-5 !bg-opacity-30 ${isDarkMode ? 'bg-white/5' : 'bg-white/40'}`}>
                        <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                            <span className="p-1.5 bg-emerald-500/10 rounded-lg">{group.icon}</span> {group.category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {group.items.map(item => {
                                const isSelected = data.includes(item);
                                return (
                                    <button
                                        key={item}
                                        onClick={() => toggleSelection(item)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm transition-all border font-medium",
                                            isSelected
                                                ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                                                : (isDarkMode
                                                    ? "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-emerald-200")
                                        )}
                                    >
                                        {item}
                                    </button>
                                );
                            })}
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className={`flex justify-between mt-8 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <Button variant="outline" onClick={onBack} isDarkMode={isDarkMode}>Back</Button>
                <Button onClick={onNext} isDarkMode={isDarkMode}>
                    Next Step <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </StepContainer>
    );
};

export const InterestStep = ({ data, update, onNext, onBack }) => {
    const { isDarkMode } = useTheme();

    const toggleSelection = (item) => {
        if (data.includes(item)) {
            update(data.filter(i => i !== item));
        } else {
            update([...data, item]);
        }
    };

    return (
        <StepContainer isDarkMode={isDarkMode}>
            <Title isDarkMode={isDarkMode}>Interest Domains</Title>
            <Subtitle isDarkMode={isDarkMode}>Select the topics that intellectually stimulate you.</Subtitle>

            <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
                {TAXONOMY.interests.map((group, idx) => (
                    <div key={idx}>
                        <h3 className={`text-sm mb-3 pl-1 font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{group.category}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {group.items.map(item => (
                                <button
                                    key={item}
                                    onClick={() => toggleSelection(item)}
                                    className={cn(
                                        "p-4 rounded-xl text-left text-sm transition-all border relative overflow-hidden group font-medium",
                                        data.includes(item)
                                            ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                                            : (isDarkMode
                                                ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                                                : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50")
                                    )}
                                >
                                    <span className="relative z-10 capitalize">{item}</span>
                                    {data.includes(item) && (
                                        <motion.div
                                            layoutId="highlight_interest"
                                            className="absolute inset-0 bg-blue-500/10"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className={`flex justify-between mt-8 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <Button variant="outline" onClick={onBack} isDarkMode={isDarkMode}>Back</Button>
                <Button onClick={onNext} disabled={data.length === 0} isDarkMode={isDarkMode}>
                    Next Step <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </StepContainer>
    );
};

export const HobbyStep = ({ data, update, onNext, onBack }) => {
    const { isDarkMode } = useTheme();
    const [search, setSearch] = useState('');

    const toggleSelection = (item) => {
        if (data.includes(item)) {
            update(data.filter(i => i !== item));
        } else {
            update([...data, item]);
        }
    };

    const filteredHobbies = useMemo(() => {
        if (!search) return TAXONOMY.hobbies;
        return TAXONOMY.hobbies.map(group => ({
            ...group,
            items: group.items.filter(item => item.toLowerCase().includes(search.toLowerCase()))
        })).filter(group => group.items.length > 0);
    }, [search]);

    return (
        <StepContainer isDarkMode={isDarkMode}>
            <Title isDarkMode={isDarkMode}>Active Pursuits</Title>
            <Subtitle isDarkMode={isDarkMode}>What do you actually do in your free time?</Subtitle>

            <div className="relative mb-8">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                    type="text"
                    placeholder="Search hobbies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full border rounded-xl py-4 pl-12 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium ${isDarkMode
                        ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:bg-white/10"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500"
                        }`}
                />
            </div>

            <div className="space-y-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {filteredHobbies.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                        <Leaf className="w-12 h-12 mx-auto mb-4 text-emerald-500/50" />
                        <p className="text-lg">No hobbies found matching "{search}"</p>
                    </div>
                ) : (
                    filteredHobbies.map((group, idx) => (
                        <div key={idx}>
                            <h3 className="text-sm text-emerald-500 mb-3 pl-1 font-bold uppercase tracking-wider">{group.category}</h3>
                            <div className="flex flex-wrap gap-2">
                                {group.items.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => toggleSelection(item)}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm transition-all border font-medium",
                                            data.includes(item)
                                                ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                                                : (isDarkMode
                                                    ? "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-emerald-300")
                                        )}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className={`flex justify-between mt-8 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <Button variant="outline" onClick={onBack} isDarkMode={isDarkMode}>Back</Button>
                <Button onClick={onNext} isDarkMode={isDarkMode}>
                    Next Step <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </StepContainer>
    );
};

export const ConstraintStep = ({ data, update, onNext, onBack }) => {
    const { isDarkMode } = useTheme();
    const intensities = ['Low', 'Med', 'High'];
    const aqiSensitivities = ['Low', 'Med', 'High'];

    const isComplete = data.max_physical_intensity && data.aqi_sensitivity;

    return (
        <StepContainer isDarkMode={isDarkMode}>
            <Title isDarkMode={isDarkMode}>Final Configurations</Title>
            <Subtitle isDarkMode={isDarkMode}>Calibrating your physical bounds.</Subtitle>

            <div className="space-y-8 py-4">
                <GlassCard className={`p-6 ${isDarkMode ? 'bg-white/5' : 'bg-white/40'}`}>
                    <h3 className={`text-xl font-medium mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Activity className="w-6 h-6 text-emerald-500" />
                        Max Physical Intensity
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        {intensities.map(level => (
                            <button
                                key={level}
                                onClick={() => update({ ...data, max_physical_intensity: level.toLowerCase() })}
                                className={cn(
                                    "p-4 rounded-xl border transition-all text-center relative overflow-hidden group",
                                    data.max_physical_intensity === level.toLowerCase()
                                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg"
                                        : (isDarkMode
                                            ? "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-emerald-300")
                                )}
                            >
                                <span className="relative z-10 font-medium">{level}</span>
                                {data.max_physical_intensity === level.toLowerCase() && (
                                    <motion.div
                                        layoutId="highlight_intensity"
                                        className="absolute inset-0 bg-white/20"
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard className={`p-6 ${isDarkMode ? 'bg-white/5' : 'bg-white/40'}`}>
                    <h3 className={`text-xl font-medium mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Wind className="w-6 h-6 text-blue-500" />
                        AQI Sensitivity
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        {aqiSensitivities.map(level => (
                            <button
                                key={level}
                                onClick={() => update({ ...data, aqi_sensitivity: level.toLowerCase() })}
                                className={cn(
                                    "p-4 rounded-xl border transition-all text-center relative overflow-hidden group",
                                    data.aqi_sensitivity === level.toLowerCase()
                                        ? "bg-blue-500 border-blue-500 text-white shadow-lg"
                                        : (isDarkMode
                                            ? "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-blue-300")
                                )}
                            >
                                <span className="relative z-10 font-medium">{level}</span>
                                {data.aqi_sensitivity === level.toLowerCase() && (
                                    <motion.div
                                        layoutId="highlight_aqi"
                                        className="absolute inset-0 bg-white/20"
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </GlassCard>
            </div>

            <div className={`flex justify-between mt-8 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <Button variant="outline" onClick={onBack} isDarkMode={isDarkMode}>Back</Button>
                <Button onClick={onNext} disabled={!isComplete} isDarkMode={isDarkMode}>
                    Complete Profile <Check className="w-5 h-5" />
                </Button>
            </div>
        </StepContainer>
    );
};

export const CompletionStep = () => {
    const { isDarkMode } = useTheme();
    return (
        <div className="flex flex-col items-center justify-center text-center h-[60vh] space-y-12">
            <div className="relative">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative z-10"
                >
                    <Check className="w-16 h-16 text-white" />
                </motion.div>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 bg-emerald-500/50 rounded-full z-0"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
            >
                <h1 className={`text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile Calibrated</h1>
                <p className={`max-w-lg mx-auto text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your nature persona has been successfully analyzed. <br />Generating your personalized wellness plan.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-3 items-center px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium animate-pulse"
            >
                <Activity className="w-5 h-5" />
                <span>Processing biometrics...</span>
            </motion.div>
        </div>
    );
};
