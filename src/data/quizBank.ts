import type { QuizQuestion } from '../types';

const B = (subject: string, question: string, options: [string, string, string, string], correct: number): QuizQuestion => ({
  id: 'b_' + question.replace(/\W+/g, '-').slice(0, 32).toLowerCase(),
  subject, question, options: [...options], correct,
});

export const QUIZ_BANK: QuizQuestion[] = [
  // Mathematics
  B('Mathematics', 'What is the derivative of x²?', ['2x', 'x', 'x²', '2'], 0),
  B('Mathematics', 'What is 15% of 200?', ['15', '20', '30', '35'], 2),
  B('Mathematics', 'What is √144?', ['10', '11', '12', '14'], 2),
  B('Mathematics', 'What is the next prime number after 13?', ['15', '16', '17', '19'], 2),
  B('Mathematics', 'Sum of interior angles of a triangle?', ['90°', '180°', '270°', '360°'], 1),
  B('Mathematics', 'Solve for x: 2x + 6 = 14', ['x = 3', 'x = 4', 'x = 5', 'x = 6'], 1),
  // Physics
  B('Physics', 'What is the SI unit of force?', ['Joule', 'Newton', 'Watt', 'Pascal'], 1),
  B('Physics', 'Approximate speed of light in vacuum?', ['150,000 km/s', '300,000 km/s', '500,000 km/s', '1,000,000 km/s'], 1),
  B('Physics', "Newton's second law states F = ?", ['m·v', 'm·a', 'm·g', 'm·d'], 1),
  B('Physics', 'What is the SI unit of energy?', ['Newton', 'Watt', 'Joule', 'Ampere'], 2),
  B('Physics', "Earth's gravitational acceleration is about?", ['3.7 m/s²', '5.8 m/s²', '9.8 m/s²', '12.4 m/s²'], 2),
  // Chemistry
  B('Chemistry', 'What is the chemical symbol for gold?', ['Gd', 'Go', 'Au', 'Ag'], 2),
  B('Chemistry', 'What is the pH of pure water?', ['5', '6', '7', '8'], 2),
  B('Chemistry', 'Atomic number of carbon?', ['4', '6', '8', '12'], 1),
  B('Chemistry', 'Most abundant gas in the atmosphere?', ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Argon'], 2),
  B('Chemistry', 'Chemical formula of table salt?', ['NaCl', 'KCl', 'NaCO₃', 'CaCl₂'], 0),
  // Biology
  B('Biology', 'Which organelle is the powerhouse of the cell?', ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], 2),
  B('Biology', 'DNA stands for?', ['Deoxyribose Nucleic Acid', 'Deoxyribonucleic Acid', 'Dinucleic Acid', 'Dual Nucleic Acid'], 1),
  B('Biology', 'The largest organ of the human body?', ['Liver', 'Brain', 'Lungs', 'Skin'], 3),
  B('Biology', 'How many chambers does the human heart have?', ['2', '3', '4', '5'], 2),
  B('Biology', 'Which process do plants use to make food?', ['Respiration', 'Photosynthesis', 'Transpiration', 'Digestion'], 1),
  // English
  B('English', 'What is the past tense of "go"?', ['goed', 'gone', 'went', 'going'], 2),
  B('English', 'Which word is a synonym of "happy"?', ['gloomy', 'joyful', 'angry', 'tired'], 1),
  B('English', 'Choose the correct sentence:', ['She don\'t like coffee', 'She doesn\'t likes coffee', 'She doesn\'t like coffee', 'She not like coffee'], 2),
  B('English', 'What is the plural of "child"?', ['childs', 'childes', 'childrens', 'children'], 3),
  B('English', '"Abundant" means…', ['scarce', 'plentiful', 'small', 'weak'], 1),
  // Persian & World Literature
  B('Literature', 'Who wrote the Shahnameh?', ['Hafez', 'Saadi', 'Ferdowsi', 'Rumi'], 2),
  B('Literature', 'Hafez is most famous for which poetic form?', ['Epic', 'Ghazal', 'Sonnet', 'Haiku'], 1),
  B('Literature', 'Who wrote "Masnavi-ye Ma\'navi"?', ['Saadi', 'Attar', 'Rumi (Mowlavi)', 'Khayyam'], 2),
  B('Literature', 'Who is the author of "Golestan"?', ['Saadi', 'Hafez', 'Ferdowsi', 'Nezami'], 0),
  B('Literature', 'Which of these works is an epic poem?', ['Golestan', 'Divan-e Hafez', 'Shahnameh', 'Bustan'], 2),
  B('Literature', 'Who wrote "Romeo and Juliet"?', ['Charles Dickens', 'William Shakespeare', 'Victor Hugo', 'Tolstoy'], 1),
  // Computer Science
  B('Computer Science', 'CPU stands for?', ['Central Program Utility', 'Central Processing Unit', 'Computer Personal Unit', 'Control Process Unit'], 1),
  B('Computer Science', 'The base of the binary system?', ['8', '10', '16', '2'], 3),
  B('Computer Science', 'Which of the following is an operating system?', ['Python', 'Linux', 'MySQL', 'Photoshop'], 1),
  B('Computer Science', 'What port does HTTP use by default?', ['21', '80', '443', '8080'], 1),
  B('Computer Science', 'RAM is what kind of memory?', ['Permanent', 'Volatile', 'Optical', 'Magnetic'], 1),
  // General Knowledge
  B('General Knowledge', 'The largest planet in the solar system?', ['Saturn', 'Earth', 'Jupiter', 'Neptune'], 2),
  B('General Knowledge', 'Capital of Iran?', ['Isfahan', 'Tehran', 'Shiraz', 'Mashhad'], 1),
  B('General Knowledge', 'In which year did World War II end?', ['1918', '1939', '1945', '1950'], 2),
  B('General Knowledge', 'The longest river in the world?', ['Amazon', 'Yangtze', 'Mississippi', 'Nile'], 3),
  B('General Knowledge', 'How many continents are on Earth?', ['5', '6', '7', '8'], 2),
  B('General Knowledge', 'Which country gifted the Statue of Liberty to the USA?', ['England', 'France', 'Spain', 'Italy'], 1),
];

export const BANK_SUBJECTS = [...new Set(QUIZ_BANK.map(q => q.subject))];
