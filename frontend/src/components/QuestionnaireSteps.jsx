import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, ArrowRight, Activity, Heart, Brain, Bone, Leaf, Search } from 'lucide-react';
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
const Title = ({ children, isDarkMode }) => (
    <h2 className={`text-3xl font-bold mb-2 text-transparent bg-clip-text ${isDarkMode
            ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600'
        }`}>
        {children}
    </h2>
);

const Subtitle = ({ children, isDarkMode }) => (
    <p className={`mb-8 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{children}</p>
);

const StepContainer = ({ children, className, isDarkMode }) => (
    <div className={cn(
        "w-full max-w-4xl mx-auto p-6 rounded-3xl backdrop-blur-md shadow-2xl transition-all duration-300",
        isDarkMode
            ? "bg-white/5 border border-white/10"
            : "bg-white/60 border border-white/40 shadow-emerald-900/5",
        className
    )}>
        {children}
    </div>
);

const Button = ({ onClick, disabled, children, className, isDarkMode }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2",
            disabled
                ? (isDarkMode ? "bg-gray-700/50 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed")
                : (isDarkMode
                    ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95"
                ),
            className
        )}
    >
        {children}
    </button>
);

// --- Steps ---

export const IntroStep = ({ onNext }) => {
    const { isDarkMode } = useTheme();
    return (
        <div className="flex flex-col items-center justify-center text-center h-[60vh] space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className={`text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent mb-6 ${isDarkMode
                        ? 'bg-gradient-to-b from-white to-gray-400'
                        : 'bg-gradient-to-b from-gray-900 to-gray-600'
                    }`}>
                    Discover Your<br />Nature Persona
                </h1>
                <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    A journey to understand your cognitive, physical, and environmental alignment.
                    Takes 2 minutes.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <Button onClick={onNext} isDarkMode={isDarkMode} className="text-lg px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    Begin Assessment <ArrowRight className="w-5 h-5" />
                </Button>
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
        <StepContainer isDarkMode={isDarkMode}>
            <Title isDarkMode={isDarkMode}>Code Your Personality</Title>
            <Subtitle isDarkMode={isDarkMode}>Rate how strongly you agree with each statement (1 = Strongly Disagree, 5 = Strongly Agree).</Subtitle>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {LIKERT_QUESTIONS.map((question, qIndex) => (
                    <motion.div
                        key={qIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: qIndex * 0.05 }}
                        className={`p-4 rounded-2xl transition-colors border ${isDarkMode
                                ? 'bg-white/5 hover:bg-white/10 border-white/5'
                                : 'bg-white/50 hover:bg-white border-gray-100 shadow-sm'
                            }`}
                    >
                        <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{qIndex + 1}. {question}</p>
                        <div className="flex justify-between items-center px-2">
                            <span className={`text-xs uppercase tracking-widest hidden sm:block ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Disagree</span>
                            <div className="flex gap-2 sm:gap-4 flex-1 justify-center">
                                {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => handleSelect(qIndex, val)}
                                        className={cn(
                                            "w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-all duration-200",
                                            data[qIndex] === val
                                                ? "bg-emerald-500 text-white border-emerald-500 scale-110 shadow-lg shadow-emerald-500/30"
                                                : (isDarkMode
                                                    ? "bg-white/5 text-gray-400 border-white/10 hover:bg-white/20 hover:scale-105"
                                                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-emerald-200 hover:scale-105")
                                        )}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                            <span className={`text-xs uppercase tracking-widest hidden sm:block ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Agree</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className={`flex justify-between mt-8 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <button onClick={onBack} className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Back</button>
                <Button onClick={onNext} disabled={!isComplete} isDarkMode={isDarkMode}>
                    Next Step <ChevronRight className="w-4 h-4" />
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
                    <div key={idx} className="space-y-3">
                        <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                            {group.icon} {group.category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {group.items.map(item => {
                                const isSelected = data.includes(item);
                                return (
                                    <button
                                        key={item}
                                        onClick={() => toggleSelection(item)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm transition-all border",
                                            isSelected
                                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300"
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
                    </div>
                ))}
            </div>

            <div className={`flex justify-between mt-8 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <button onClick={onBack} className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Back</button>
                <Button onClick={onNext} isDarkMode={isDarkMode}>
                    Next Step <ChevronRight className="w-4 h-4" />
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
                        <h3 className={`text-sm mb-2 pl-1 font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{group.category}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {group.items.map(item => (
                                <button
                                    key={item}
                                    onClick={() => toggleSelection(item)}
                                    className={cn(
                                        "p-3 rounded-xl text-left text-sm transition-all border relative overflow-hidden group",
                                        data.includes(item)
                                            ? "bg-blue-500/20 border-blue-400 text-blue-600 dark:text-blue-200"
                                            : (isDarkMode
                                                ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                                                : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50")
                                    )}
                                >
                                    <span className="relative z-10 capitalize">{item}</span>
                                    {data.includes(item) && (
                                        <motion.div
                                            layoutId="highlight"
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
                <button onClick={onBack} className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Back</button>
                <Button onClick={onNext} disabled={data.length === 0} isDarkMode={isDarkMode}>
                    Next Step <ChevronRight className="w-4 h-4" />
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

            <div className="relative mb-6">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                    type="text"
                    placeholder="Search hobbies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full border rounded-xl py-3 pl-12 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode
                            ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:bg-white/10"
                            : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500"
                        }`}
                />
            </div>

            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {filteredHobbies.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">No hobbies found matching "{search}"</p>
                ) : (
                    filteredHobbies.map((group, idx) => (
                        <div key={idx}>
                            <h3 className="text-sm text-emerald-500 mb-2 pl-1 font-medium">{group.category}</h3>
                            <div className="flex flex-wrap gap-2">
                                {group.items.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => toggleSelection(item)}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm transition-all border",
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
                <button onClick={onBack} className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Back</button>
                <Button onClick={onNext} isDarkMode={isDarkMode}>
                    Next Step <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </StepContainer>
    );
};

export const ConstraintStep = ({ data, update, onNext, onBack }) => {
    const { isDarkMode } = useTheme();
    const intensities = ['Low', 'Medium', 'High'];
    const aqiSensitivities = ['Low', 'Medium', 'High'];

    const isComplete = data.max_physical_intensity && data.aqi_sensitivity;

    return (
        <StepContainer isDarkMode={isDarkMode}>
            <Title isDarkMode={isDarkMode}>Final Configurations</Title>
            <Subtitle isDarkMode={isDarkMode}>Calibrating your physical bounds.</Subtitle>

            <div className="space-y-12 py-8">
                <div>
                    <h3 className={`text-xl font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Max Physical Intensity</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {intensities.map(level => (
                            <button
                                key={level}
                                onClick={() => update({ ...data, max_physical_intensity: level.toLowerCase() })}
                                className={cn(
                                    "p-4 rounded-xl border transition-all text-center",
                                    data.max_physical_intensity === level.toLowerCase()
                                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg"
                                        : (isDarkMode
                                            ? "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-emerald-300")
                                )}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className={`text-xl font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AQI Sensitivity</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {aqiSensitivities.map(level => (
                            <button
                                key={level}
                                onClick={() => update({ ...data, aqi_sensitivity: level.toLowerCase() })}
                                className={cn(
                                    "p-4 rounded-xl border transition-all text-center",
                                    data.aqi_sensitivity === level.toLowerCase()
                                        ? "bg-blue-500 border-blue-500 text-white shadow-lg"
                                        : (isDarkMode
                                            ? "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-blue-300")
                                )}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`flex justify-between mt-8 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <button onClick={onBack} className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Back</button>
                <Button onClick={onNext} disabled={!isComplete} isDarkMode={isDarkMode}>
                    Complete Profile <Check className="w-4 h-4" />
                </Button>
            </div>
        </StepContainer>
    );
};

export const CompletionStep = () => {
    const { isDarkMode } = useTheme();
    return (
        <div className="flex flex-col items-center justify-center text-center h-[60vh] space-y-8">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50"
            >
                <Check className="w-12 h-12 text-white" />
            </motion.div>
            <div>
                <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile Calibrated</h1>
                <p className={`max-w-md mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your nature persona has been successfully analyzed. We are now generating your personalized wellness plan.
                </p>
            </div>

            <div className="flex gap-2 items-center text-emerald-400 text-sm animate-pulse">
                <Activity className="w-4 h-4" />
                <span>Processing biometric analogs...</span>
            </div>
        </div>
    );
};
