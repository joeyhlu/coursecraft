const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const BUILDINGS = {
  'Science Hall': { lat: 40.7580, lng: -73.9855, abbr: 'SCI' },
  'Engineering Center': { lat: 40.7590, lng: -73.9870, abbr: 'ENG' },
  'Liberal Arts Building': { lat: 40.7575, lng: -73.9840, abbr: 'LAB' },
  'Business School': { lat: 40.7600, lng: -73.9880, abbr: 'BUS' },
  'Math & CS Building': { lat: 40.7585, lng: -73.9860, abbr: 'MCS' },
  'Student Center': { lat: 40.7570, lng: -73.9850, abbr: 'STU' },
  'Health Sciences': { lat: 40.7610, lng: -73.9890, abbr: 'HSC' },
  'Fine Arts Center': { lat: 40.7565, lng: -73.9835, abbr: 'FAC' },
  'Library Hall': { lat: 40.7578, lng: -73.9848, abbr: 'LIB' },
  'Lecture Complex': { lat: 40.7592, lng: -73.9865, abbr: 'LEC' },
};

function getWalkingTime(building1, building2) {
  if (building1 === building2) return 0;
  const b1 = BUILDINGS[building1];
  const b2 = BUILDINGS[building2];
  if (!b1 || !b2) return 15;
  const dx = (b1.lat - b2.lat) * 111000;
  const dy = (b1.lng - b2.lng) * 85000;
  const meters = Math.sqrt(dx * dx + dy * dy);
  return Math.round(meters / 80); // ~80m/min walking speed
}

const COURSES = [
  { id: 'CS101', name: 'Intro to Computer Science', dept: 'CS', credits: 3, sections: [
    { id: 'CS101-A', days: ['Mon', 'Wed', 'Fri'], startTime: '08:00', endTime: '08:50', building: 'Math & CS Building', room: '101', professor: 'Dr. Chen', seats: 40, enrolled: 38 },
    { id: 'CS101-B', days: ['Mon', 'Wed', 'Fri'], startTime: '10:00', endTime: '10:50', building: 'Math & CS Building', room: '205', professor: 'Dr. Martinez', seats: 40, enrolled: 40 },
    { id: 'CS101-C', days: ['Tue', 'Thu'], startTime: '13:00', endTime: '14:15', building: 'Lecture Complex', room: '300', professor: 'Dr. Chen', seats: 60, enrolled: 55 },
  ]},
  { id: 'CS201', name: 'Data Structures', dept: 'CS', credits: 3, sections: [
    { id: 'CS201-A', days: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '09:50', building: 'Math & CS Building', room: '302', professor: 'Dr. Park', seats: 35, enrolled: 34 },
    { id: 'CS201-B', days: ['Tue', 'Thu'], startTime: '09:30', endTime: '10:45', building: 'Math & CS Building', room: '302', professor: 'Dr. Park', seats: 35, enrolled: 30 },
    { id: 'CS201-C', days: ['Mon', 'Wed'], startTime: '14:00', endTime: '15:15', building: 'Engineering Center', room: '110', professor: 'Dr. Liu', seats: 35, enrolled: 35 },
  ]},
  { id: 'CS301', name: 'Algorithms', dept: 'CS', credits: 3, sections: [
    { id: 'CS301-A', days: ['Tue', 'Thu'], startTime: '08:00', endTime: '09:15', building: 'Math & CS Building', room: '401', professor: 'Dr. Gupta', seats: 30, enrolled: 28 },
    { id: 'CS301-B', days: ['Mon', 'Wed', 'Fri'], startTime: '11:00', endTime: '11:50', building: 'Math & CS Building', room: '401', professor: 'Dr. Gupta', seats: 30, enrolled: 30 },
  ]},
  { id: 'CS350', name: 'Database Systems', dept: 'CS', credits: 3, sections: [
    { id: 'CS350-A', days: ['Mon', 'Wed'], startTime: '15:30', endTime: '16:45', building: 'Math & CS Building', room: '205', professor: 'Dr. Williams', seats: 30, enrolled: 25 },
    { id: 'CS350-B', days: ['Tue', 'Thu'], startTime: '11:00', endTime: '12:15', building: 'Engineering Center', room: '205', professor: 'Dr. Williams', seats: 30, enrolled: 29 },
  ]},
  { id: 'CS400', name: 'Machine Learning', dept: 'CS', credits: 3, sections: [
    { id: 'CS400-A', days: ['Tue', 'Thu'], startTime: '14:00', endTime: '15:15', building: 'Math & CS Building', room: '501', professor: 'Dr. Zhang', seats: 25, enrolled: 24 },
    { id: 'CS400-B', days: ['Mon', 'Wed', 'Fri'], startTime: '13:00', endTime: '13:50', building: 'Math & CS Building', room: '501', professor: 'Dr. Zhang', seats: 25, enrolled: 25 },
  ]},
  { id: 'MATH101', name: 'Calculus I', dept: 'MATH', credits: 4, sections: [
    { id: 'MATH101-A', days: ['Mon', 'Tue', 'Wed', 'Thu'], startTime: '08:00', endTime: '08:50', building: 'Math & CS Building', room: '100', professor: 'Dr. Adams', seats: 50, enrolled: 45 },
    { id: 'MATH101-B', days: ['Mon', 'Tue', 'Wed', 'Thu'], startTime: '10:00', endTime: '10:50', building: 'Library Hall', room: '200', professor: 'Dr. Baker', seats: 50, enrolled: 50 },
    { id: 'MATH101-C', days: ['Mon', 'Tue', 'Wed', 'Thu'], startTime: '14:00', endTime: '14:50', building: 'Lecture Complex', room: '100', professor: 'Dr. Adams', seats: 50, enrolled: 42 },
  ]},
  { id: 'MATH201', name: 'Linear Algebra', dept: 'MATH', credits: 3, sections: [
    { id: 'MATH201-A', days: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '09:50', building: 'Math & CS Building', room: '200', professor: 'Dr. Singh', seats: 40, enrolled: 38 },
    { id: 'MATH201-B', days: ['Tue', 'Thu'], startTime: '13:00', endTime: '14:15', building: 'Math & CS Building', room: '200', professor: 'Dr. Singh', seats: 40, enrolled: 36 },
  ]},
  { id: 'STAT301', name: 'Probability & Statistics', dept: 'MATH', credits: 3, sections: [
    { id: 'STAT301-A', days: ['Mon', 'Wed', 'Fri'], startTime: '10:00', endTime: '10:50', building: 'Math & CS Building', room: '300', professor: 'Dr. Lee', seats: 35, enrolled: 33 },
    { id: 'STAT301-B', days: ['Tue', 'Thu'], startTime: '15:00', endTime: '16:15', building: 'Library Hall', room: '105', professor: 'Dr. Lee', seats: 35, enrolled: 28 },
  ]},
  { id: 'ENG201', name: 'Circuit Analysis', dept: 'ENG', credits: 3, sections: [
    { id: 'ENG201-A', days: ['Mon', 'Wed', 'Fri'], startTime: '08:00', endTime: '08:50', building: 'Engineering Center', room: '201', professor: 'Dr. Tesla', seats: 30, enrolled: 28 },
    { id: 'ENG201-B', days: ['Tue', 'Thu'], startTime: '10:00', endTime: '11:15', building: 'Engineering Center', room: '201', professor: 'Dr. Tesla', seats: 30, enrolled: 27 },
  ]},
  { id: 'ENG301', name: 'Thermodynamics', dept: 'ENG', credits: 3, sections: [
    { id: 'ENG301-A', days: ['Mon', 'Wed'], startTime: '11:00', endTime: '12:15', building: 'Engineering Center', room: '305', professor: 'Dr. Kelvin', seats: 25, enrolled: 22 },
    { id: 'ENG301-B', days: ['Tue', 'Thu'], startTime: '08:00', endTime: '09:15', building: 'Engineering Center', room: '305', professor: 'Dr. Kelvin', seats: 25, enrolled: 24 },
  ]},
  { id: 'BUS101', name: 'Intro to Business', dept: 'BUS', credits: 3, sections: [
    { id: 'BUS101-A', days: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '09:50', building: 'Business School', room: '100', professor: 'Dr. Warren', seats: 60, enrolled: 55 },
    { id: 'BUS101-B', days: ['Tue', 'Thu'], startTime: '11:00', endTime: '12:15', building: 'Business School', room: '100', professor: 'Dr. Morgan', seats: 60, enrolled: 58 },
  ]},
  { id: 'BUS220', name: 'Financial Accounting', dept: 'BUS', credits: 3, sections: [
    { id: 'BUS220-A', days: ['Mon', 'Wed'], startTime: '13:00', endTime: '14:15', building: 'Business School', room: '210', professor: 'Dr. Price', seats: 40, enrolled: 37 },
    { id: 'BUS220-B', days: ['Tue', 'Thu'], startTime: '09:30', endTime: '10:45', building: 'Business School', room: '210', professor: 'Dr. Price', seats: 40, enrolled: 40 },
  ]},
  { id: 'BUS350', name: 'Marketing Strategy', dept: 'BUS', credits: 3, sections: [
    { id: 'BUS350-A', days: ['Mon', 'Wed'], startTime: '15:00', endTime: '16:15', building: 'Business School', room: '315', professor: 'Dr. Kotler', seats: 35, enrolled: 30 },
    { id: 'BUS350-B', days: ['Tue', 'Thu'], startTime: '13:30', endTime: '14:45', building: 'Student Center', room: '200', professor: 'Dr. Kotler', seats: 35, enrolled: 33 },
  ]},
  { id: 'BIO101', name: 'General Biology', dept: 'SCI', credits: 4, sections: [
    { id: 'BIO101-A', days: ['Mon', 'Wed', 'Fri'], startTime: '08:00', endTime: '08:50', building: 'Science Hall', room: '120', professor: 'Dr. Darwin', seats: 45, enrolled: 40 },
    { id: 'BIO101-B', days: ['Tue', 'Thu'], startTime: '10:00', endTime: '11:15', building: 'Science Hall', room: '120', professor: 'Dr. Darwin', seats: 45, enrolled: 44 },
  ]},
  { id: 'CHEM201', name: 'Organic Chemistry', dept: 'SCI', credits: 4, sections: [
    { id: 'CHEM201-A', days: ['Mon', 'Wed', 'Fri'], startTime: '11:00', endTime: '11:50', building: 'Science Hall', room: '250', professor: 'Dr. Curie', seats: 30, enrolled: 29 },
    { id: 'CHEM201-B', days: ['Tue', 'Thu'], startTime: '14:00', endTime: '15:15', building: 'Science Hall', room: '250', professor: 'Dr. Curie', seats: 30, enrolled: 27 },
  ]},
  { id: 'PHYS101', name: 'Physics I', dept: 'SCI', credits: 4, sections: [
    { id: 'PHYS101-A', days: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '09:50', building: 'Science Hall', room: '300', professor: 'Dr. Newton', seats: 40, enrolled: 38 },
    { id: 'PHYS101-B', days: ['Tue', 'Thu'], startTime: '13:00', endTime: '14:15', building: 'Science Hall', room: '300', professor: 'Dr. Newton', seats: 40, enrolled: 35 },
  ]},
  { id: 'ENG110', name: 'English Composition', dept: 'HUM', credits: 3, sections: [
    { id: 'ENG110-A', days: ['Mon', 'Wed', 'Fri'], startTime: '10:00', endTime: '10:50', building: 'Liberal Arts Building', room: '110', professor: 'Dr. Shakespeare', seats: 25, enrolled: 22 },
    { id: 'ENG110-B', days: ['Tue', 'Thu'], startTime: '08:00', endTime: '09:15', building: 'Liberal Arts Building', room: '110', professor: 'Dr. Austen', seats: 25, enrolled: 24 },
  ]},
  { id: 'PSY101', name: 'Intro to Psychology', dept: 'HUM', credits: 3, sections: [
    { id: 'PSY101-A', days: ['Mon', 'Wed', 'Fri'], startTime: '13:00', endTime: '13:50', building: 'Liberal Arts Building', room: '300', professor: 'Dr. Freud', seats: 50, enrolled: 48 },
    { id: 'PSY101-B', days: ['Tue', 'Thu'], startTime: '15:30', endTime: '16:45', building: 'Student Center', room: '300', professor: 'Dr. Jung', seats: 50, enrolled: 42 },
  ]},
  { id: 'ART150', name: 'Digital Art & Design', dept: 'ART', credits: 3, sections: [
    { id: 'ART150-A', days: ['Mon', 'Wed'], startTime: '16:00', endTime: '17:15', building: 'Fine Arts Center', room: '100', professor: 'Prof. Warhol', seats: 20, enrolled: 18 },
    { id: 'ART150-B', days: ['Tue', 'Thu'], startTime: '11:00', endTime: '12:15', building: 'Fine Arts Center', room: '100', professor: 'Prof. Warhol', seats: 20, enrolled: 19 },
  ]},
  { id: 'MUS100', name: 'Music Appreciation', dept: 'ART', credits: 3, sections: [
    { id: 'MUS100-A', days: ['Mon', 'Wed', 'Fri'], startTime: '14:00', endTime: '14:50', building: 'Fine Arts Center', room: '200', professor: 'Dr. Mozart', seats: 40, enrolled: 35 },
    { id: 'MUS100-B', days: ['Tue', 'Thu'], startTime: '16:00', endTime: '17:15', building: 'Fine Arts Center', room: '200', professor: 'Dr. Mozart', seats: 40, enrolled: 30 },
  ]},
  { id: 'HSC200', name: 'Human Anatomy', dept: 'HSC', credits: 4, sections: [
    { id: 'HSC200-A', days: ['Mon', 'Wed', 'Fri'], startTime: '08:00', endTime: '08:50', building: 'Health Sciences', room: '100', professor: 'Dr. Gray', seats: 35, enrolled: 33 },
    { id: 'HSC200-B', days: ['Tue', 'Thu'], startTime: '10:00', endTime: '11:15', building: 'Health Sciences', room: '100', professor: 'Dr. Gray', seats: 35, enrolled: 34 },
  ]},
];

const PROFESSOR_RATINGS = {
  'Dr. Chen':       { quality: 4.2, difficulty: 3.1, wouldTakeAgain: 82, numRatings: 147, dept: 'Computer Science', tags: ['Tough Grader', 'Inspirational', 'Lots of Homework'], topReview: 'Challenging but fair. Lectures are engaging and he really cares about students learning the material.' },
  'Dr. Martinez':   { quality: 3.5, difficulty: 3.8, wouldTakeAgain: 55, numRatings: 89, dept: 'Computer Science', tags: ['Tough Grader', 'Test Heavy', 'Skip Class? You Won\'t Pass'], topReview: 'Know your stuff before walking in. Tests are brutal but the curve is generous.' },
  'Dr. Park':       { quality: 4.6, difficulty: 3.4, wouldTakeAgain: 91, numRatings: 203, dept: 'Computer Science', tags: ['Amazing Lectures', 'Caring', 'Clear Grading Criteria'], topReview: 'Best CS professor I\'ve had. Makes data structures actually fun and explains things so clearly.' },
  'Dr. Liu':        { quality: 3.2, difficulty: 4.2, wouldTakeAgain: 42, numRatings: 67, dept: 'Computer Science', tags: ['Tough Grader', 'Heavy Homework', 'Get Ready to Read'], topReview: 'Very knowledgeable but lectures can be hard to follow. Office hours are helpful though.' },
  'Dr. Gupta':      { quality: 4.4, difficulty: 3.9, wouldTakeAgain: 85, numRatings: 156, dept: 'Computer Science', tags: ['Respected', 'Hilarious', 'Tough but Fair'], topReview: 'Algorithms is already hard but Dr. Gupta makes it bearable with his humor. Do the practice problems!' },
  'Dr. Williams':   { quality: 3.8, difficulty: 2.9, wouldTakeAgain: 73, numRatings: 112, dept: 'Computer Science', tags: ['Accessible Outside Class', 'Group Projects', 'Participation Matters'], topReview: 'Reasonable workload, explains databases well. The group project can be a lot but it\'s a good learning experience.' },
  'Dr. Zhang':      { quality: 4.7, difficulty: 4.5, wouldTakeAgain: 88, numRatings: 94, dept: 'Computer Science', tags: ['Inspirational', 'Tough Grader', 'Extra Credit'], topReview: 'Literally the smartest professor I\'ve ever had. ML is hard but she makes it make sense. Research opportunities too!' },
  'Dr. Adams':      { quality: 3.9, difficulty: 3.3, wouldTakeAgain: 70, numRatings: 234, dept: 'Mathematics', tags: ['Clear Grading Criteria', 'Lots of Homework', 'Textbook Heavy'], topReview: 'Solid calc professor. Does a lot of examples in class which is helpful. Homework is a lot but it prepares you for exams.' },
  'Dr. Baker':      { quality: 2.8, difficulty: 4.1, wouldTakeAgain: 35, numRatings: 178, dept: 'Mathematics', tags: ['Tough Grader', 'Lecture Heavy', 'Skip Class? You Won\'t Pass'], topReview: 'Avoid if you can. Lectures are confusing and the exams test things not covered in class.' },
  'Dr. Singh':      { quality: 4.3, difficulty: 3.0, wouldTakeAgain: 87, numRatings: 145, dept: 'Mathematics', tags: ['Amazing Lectures', 'Gives Good Feedback', 'Caring'], topReview: 'Linear algebra clicked for me because of Dr. Singh. Very patient and approachable during office hours.' },
  'Dr. Lee':        { quality: 4.1, difficulty: 3.5, wouldTakeAgain: 78, numRatings: 99, dept: 'Mathematics', tags: ['Respected', 'Test Heavy', 'Participation Matters'], topReview: 'Stats can be dry but Dr. Lee uses real-world examples that make it interesting. Fair exams.' },
  'Dr. Tesla':      { quality: 4.5, difficulty: 3.7, wouldTakeAgain: 89, numRatings: 167, dept: 'Engineering', tags: ['Inspirational', 'Amazing Lectures', 'Tough but Fair'], topReview: 'Circuit analysis is one of the best classes I\'ve taken. Dr. Tesla is passionate and it shows.' },
  'Dr. Kelvin':     { quality: 3.6, difficulty: 4.0, wouldTakeAgain: 60, numRatings: 88, dept: 'Engineering', tags: ['Tough Grader', 'Lecture Heavy', 'Lots of Homework'], topReview: 'Thermo is hard no matter who teaches it. Dr. Kelvin is decent but you need to study a lot on your own.' },
  'Dr. Warren':     { quality: 4.0, difficulty: 2.5, wouldTakeAgain: 80, numRatings: 210, dept: 'Business', tags: ['Easy Grader', 'Inspirational', 'Group Projects'], topReview: 'Great intro to business. Dr. Warren brings in guest speakers and makes the class engaging.' },
  'Dr. Morgan':     { quality: 3.7, difficulty: 2.8, wouldTakeAgain: 68, numRatings: 134, dept: 'Business', tags: ['Participation Matters', 'Group Projects', 'Accessible Outside Class'], topReview: 'Good class but participation is a big chunk of your grade. Come prepared to discuss.' },
  'Dr. Price':      { quality: 3.4, difficulty: 3.6, wouldTakeAgain: 52, numRatings: 156, dept: 'Business', tags: ['Tough Grader', 'Test Heavy', 'Textbook Heavy'], topReview: 'Accounting is accounting. Dr. Price is fair but the material is just boring. Study the textbook.' },
  'Dr. Kotler':     { quality: 4.8, difficulty: 2.7, wouldTakeAgain: 95, numRatings: 189, dept: 'Business', tags: ['Amazing Lectures', 'Inspirational', 'Hilarious'], topReview: 'TAKE THIS CLASS. Dr. Kotler is the GOAT. Marketing has never been more fun. Easy A if you show up.' },
  'Dr. Darwin':     { quality: 4.1, difficulty: 3.2, wouldTakeAgain: 76, numRatings: 198, dept: 'Biology', tags: ['Caring', 'Clear Grading Criteria', 'Accessible Outside Class'], topReview: 'Bio is a lot of memorization but Dr. Darwin makes it manageable with great study guides.' },
  'Dr. Curie':      { quality: 4.3, difficulty: 4.4, wouldTakeAgain: 72, numRatings: 134, dept: 'Chemistry', tags: ['Tough Grader', 'Respected', 'Inspirational'], topReview: 'Orgo is brutal but Dr. Curie is one of the best professors in the department. Go to every lecture.' },
  'Dr. Newton':     { quality: 3.9, difficulty: 3.8, wouldTakeAgain: 65, numRatings: 167, dept: 'Physics', tags: ['Test Heavy', 'Lecture Heavy', 'Skip Class? You Won\'t Pass'], topReview: 'Physics I is what you\'d expect. Dr. Newton is solid but not spectacular. Do all the problem sets.' },
  'Dr. Shakespeare':{ quality: 4.6, difficulty: 2.4, wouldTakeAgain: 93, numRatings: 145, dept: 'English', tags: ['Amazing Lectures', 'Inspirational', 'Easy Grader'], topReview: 'Writing class that actually improved my writing. Dr. Shakespeare gives amazing feedback and is so encouraging.' },
  'Dr. Austen':     { quality: 4.4, difficulty: 2.6, wouldTakeAgain: 90, numRatings: 112, dept: 'English', tags: ['Caring', 'Gives Good Feedback', 'Participation Matters'], topReview: 'Love this class. Dr. Austen creates a safe space for sharing your work. Highly recommend.' },
  'Dr. Freud':      { quality: 3.3, difficulty: 3.0, wouldTakeAgain: 58, numRatings: 223, dept: 'Psychology', tags: ['Test Heavy', 'Lecture Heavy', 'Textbook Heavy'], topReview: 'Pretty standard psych intro. Lectures are okay but the tests pull from the textbook heavily.' },
  'Dr. Jung':       { quality: 4.5, difficulty: 2.9, wouldTakeAgain: 88, numRatings: 178, dept: 'Psychology', tags: ['Amazing Lectures', 'Inspirational', 'Caring'], topReview: 'Dr. Jung is incredible. Psych 101 with her changed my major. She genuinely cares about every student.' },
  'Prof. Warhol':   { quality: 4.7, difficulty: 2.2, wouldTakeAgain: 96, numRatings: 87, dept: 'Art', tags: ['Amazing Lectures', 'Easy Grader', 'Inspirational'], topReview: 'Most fun I\'ve had in a class. Prof. Warhol is super chill and the projects are actually creative and free.' },
  'Dr. Mozart':     { quality: 4.2, difficulty: 2.0, wouldTakeAgain: 85, numRatings: 156, dept: 'Music', tags: ['Easy Grader', 'Inspirational', 'Participation Matters'], topReview: 'Easy A but you actually learn a lot about music history. Dr. Mozart plays instruments in class which is cool.' },
  'Dr. Gray':       { quality: 3.8, difficulty: 3.9, wouldTakeAgain: 64, numRatings: 123, dept: 'Health Sciences', tags: ['Tough Grader', 'Test Heavy', 'Lots of Homework'], topReview: 'Anatomy is a beast. Dr. Gray is knowledgeable but the amount of material is overwhelming. Start studying early.' },
};

const users = {};
const friendships = {};

function seedDemoData() {
  users['joey'] = {
    username: 'joey',
    displayName: 'Joey',
    schedule: null,
    friends: ['girlfriend', 'bestbro', 'studybuddy', 'librarygirl', 'gymrat', 'codequeen'],
  };

  users['girlfriend'] = {
    username: 'girlfriend',
    displayName: 'Girlfriend',
    schedule: [
      { courseId: 'CS101', id: 'CS101-C', days: ['Tue', 'Thu'], startTime: '13:00', endTime: '14:15', building: 'Lecture Complex', room: '300', professor: 'Dr. Chen', courseName: 'Intro to Computer Science' },
      { courseId: 'MATH201', id: 'MATH201-A', days: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '09:50', building: 'Math & CS Building', room: '200', professor: 'Dr. Singh', courseName: 'Linear Algebra' },
      { courseId: 'PSY101', id: 'PSY101-B', days: ['Tue', 'Thu'], startTime: '15:30', endTime: '16:45', building: 'Student Center', room: '300', professor: 'Dr. Jung', courseName: 'Intro to Psychology' },
      { courseId: 'ENG110', id: 'ENG110-A', days: ['Mon', 'Wed', 'Fri'], startTime: '10:00', endTime: '10:50', building: 'Liberal Arts Building', room: '110', professor: 'Dr. Shakespeare', courseName: 'English Composition' },
      { courseId: 'ART150', id: 'ART150-A', days: ['Mon', 'Wed'], startTime: '16:00', endTime: '17:15', building: 'Fine Arts Center', room: '100', professor: 'Prof. Warhol', courseName: 'Digital Art & Design' },
    ],
    friends: ['joey'],
  };

  users['bestbro'] = {
    username: 'bestbro',
    displayName: 'Marcus',
    schedule: [
      { courseId: 'CS101', id: 'CS101-A', days: ['Mon', 'Wed', 'Fri'], startTime: '08:00', endTime: '08:50', building: 'Math & CS Building', room: '101', professor: 'Dr. Chen', courseName: 'Intro to Computer Science' },
      { courseId: 'CS201', id: 'CS201-A', days: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '09:50', building: 'Math & CS Building', room: '302', professor: 'Dr. Park', courseName: 'Data Structures' },
      { courseId: 'MATH101', id: 'MATH101-A', days: ['Tue', 'Thu'], startTime: '09:30', endTime: '10:45', building: 'Math & CS Building', room: '100', professor: 'Dr. Adams', courseName: 'Calculus I' },
      { courseId: 'PHYS101', id: 'PHYS101-A', days: ['Tue', 'Thu'], startTime: '11:00', endTime: '12:15', building: 'Science Hall', room: '300', professor: 'Dr. Newton', courseName: 'Physics I' },
      { courseId: 'ENG110', id: 'ENG110-B', days: ['Tue', 'Thu'], startTime: '08:00', endTime: '09:15', building: 'Liberal Arts Building', room: '110', professor: 'Dr. Austen', courseName: 'English Composition' },
    ],
    friends: ['joey'],
  };

  users['studybuddy'] = {
    username: 'studybuddy',
    displayName: 'Kevin',
    schedule: [
      { courseId: 'CS201', id: 'CS201-B', days: ['Tue', 'Thu'], startTime: '09:30', endTime: '10:45', building: 'Math & CS Building', room: '302', professor: 'Dr. Park', courseName: 'Data Structures' },
      { courseId: 'CS301', id: 'CS301-A', days: ['Tue', 'Thu'], startTime: '08:00', endTime: '09:15', building: 'Math & CS Building', room: '401', professor: 'Dr. Gupta', courseName: 'Algorithms' },
      { courseId: 'STAT301', id: 'STAT301-A', days: ['Mon', 'Wed', 'Fri'], startTime: '10:00', endTime: '10:50', building: 'Math & CS Building', room: '300', professor: 'Dr. Lee', courseName: 'Probability & Statistics' },
      { courseId: 'CS350', id: 'CS350-B', days: ['Tue', 'Thu'], startTime: '11:00', endTime: '12:15', building: 'Engineering Center', room: '205', professor: 'Dr. Williams', courseName: 'Database Systems' },
      { courseId: 'MATH201', id: 'MATH201-A', days: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '09:50', building: 'Math & CS Building', room: '200', professor: 'Dr. Singh', courseName: 'Linear Algebra' },
    ],
    friends: ['joey'],
  };

  users['librarygirl'] = {
    username: 'librarygirl',
    displayName: 'Sophie',
    schedule: [
      { courseId: 'CS400', id: 'CS400-A', days: ['Tue', 'Thu'], startTime: '13:00', endTime: '14:15', building: 'Math & CS Building', room: '501', professor: 'Dr. Zhang', courseName: 'Machine Learning' },
      { courseId: 'CS301', id: 'CS301-A', days: ['Tue', 'Thu'], startTime: '08:00', endTime: '09:15', building: 'Math & CS Building', room: '401', professor: 'Dr. Gupta', courseName: 'Algorithms' },
      { courseId: 'CHEM201', id: 'CHEM201-A', days: ['Mon', 'Wed', 'Fri'], startTime: '11:00', endTime: '11:50', building: 'Science Hall', room: '250', professor: 'Dr. Curie', courseName: 'Organic Chemistry' },
      { courseId: 'MATH201', id: 'MATH201-A', days: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '09:50', building: 'Math & CS Building', room: '200', professor: 'Dr. Singh', courseName: 'Linear Algebra' },
      { courseId: 'STAT301', id: 'STAT301-B', days: ['Tue', 'Thu'], startTime: '15:30', endTime: '16:45', building: 'Library Hall', room: '105', professor: 'Dr. Lee', courseName: 'Probability & Statistics' },
    ],
    friends: ['joey'],
  };

  users['gymrat'] = {
    username: 'gymrat',
    displayName: 'Tyler',
    schedule: [
      { courseId: 'CS101', id: 'CS101-A', days: ['Mon', 'Wed', 'Fri'], startTime: '08:00', endTime: '08:50', building: 'Math & CS Building', room: '101', professor: 'Dr. Chen', courseName: 'Intro to Computer Science' },
      { courseId: 'ENG201', id: 'ENG201-A', days: ['Tue', 'Thu'], startTime: '08:00', endTime: '09:15', building: 'Engineering Center', room: '201', professor: 'Dr. Tesla', courseName: 'Circuit Analysis' },
      { courseId: 'BUS101', id: 'BUS101-A', days: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '09:50', building: 'Business School', room: '100', professor: 'Dr. Warren', courseName: 'Intro to Business' },
      { courseId: 'HSC200', id: 'HSC200-A', days: ['Mon', 'Wed', 'Fri'], startTime: '10:00', endTime: '10:50', building: 'Health Sciences', room: '100', professor: 'Dr. Gray', courseName: 'Human Anatomy' },
      { courseId: 'BIO101', id: 'BIO101-A', days: ['Tue', 'Thu'], startTime: '09:30', endTime: '10:45', building: 'Science Hall', room: '120', professor: 'Dr. Darwin', courseName: 'General Biology' },
    ],
    friends: ['joey'],
  };

  users['codequeen'] = {
    username: 'codequeen',
    displayName: 'Priya',
    schedule: [
      { courseId: 'CS400', id: 'CS400-A', days: ['Tue', 'Thu'], startTime: '14:30', endTime: '15:45', building: 'Math & CS Building', room: '501', professor: 'Dr. Zhang', courseName: 'Machine Learning' },
      { courseId: 'CS301', id: 'CS301-B', days: ['Mon', 'Wed', 'Fri'], startTime: '11:00', endTime: '11:50', building: 'Math & CS Building', room: '401', professor: 'Dr. Gupta', courseName: 'Algorithms' },
      { courseId: 'CS350', id: 'CS350-A', days: ['Mon', 'Wed'], startTime: '13:00', endTime: '14:15', building: 'Math & CS Building', room: '205', professor: 'Dr. Williams', courseName: 'Database Systems' },
      { courseId: 'CS201', id: 'CS201-B', days: ['Tue', 'Thu'], startTime: '09:30', endTime: '10:45', building: 'Math & CS Building', room: '302', professor: 'Dr. Park', courseName: 'Data Structures' },
      { courseId: 'MATH201', id: 'MATH201-B', days: ['Tue', 'Thu'], startTime: '13:00', endTime: '14:15', building: 'Math & CS Building', room: '200', professor: 'Dr. Singh', courseName: 'Linear Algebra' },
    ],
    friends: ['joey'],
  };
}

seedDemoData();

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function sectionsOverlap(s1, s2) {
  const commonDays = s1.days.filter(d => s2.days.includes(d));
  if (commonDays.length === 0) return false;
  const start1 = timeToMinutes(s1.startTime), end1 = timeToMinutes(s1.endTime);
  const start2 = timeToMinutes(s2.startTime), end2 = timeToMinutes(s2.endTime);
  return start1 < end2 && start2 < end1;
}

function hasWalkingConflict(s1, s2) {
  const commonDays = s1.days.filter(d => s2.days.includes(d));
  if (commonDays.length === 0) return false;
  const end1 = timeToMinutes(s1.endTime), start2 = timeToMinutes(s2.startTime);
  const end2 = timeToMinutes(s2.endTime), start1 = timeToMinutes(s1.startTime);
  
  if (end1 <= start2) {
    const gap = start2 - end1;
    const walkTime = getWalkingTime(s1.building, s2.building);
    return gap < walkTime;
  }
  if (end2 <= start1) {
    const gap = start1 - end2;
    const walkTime = getWalkingTime(s2.building, s1.building);
    return gap < walkTime;
  }
  return false;
}

function scoreSchedule(selectedSections, preferences) {
  let score = 0;
  const { preferMorning, preferAfternoon, preferSpread, preferCompact, avoidWalking, preferHighRated, maxGapMinutes } = preferences;

  for (const sec of selectedSections) {
    const startMin = timeToMinutes(sec.startTime);

    // Morning preference (before 12pm)
    if (preferMorning && startMin < 720) score += 10;
    if (preferMorning && startMin < 600) score += 5; // extra for early

    // Afternoon preference
    if (preferAfternoon && startMin >= 720) score += 10;

    // Seat availability bonus
    const availableSeats = sec.seats - sec.enrolled;
    if (availableSeats > 5) score += 8;
    else if (availableSeats > 0) score += 3;
    else score -= 20; // Full class penalty

    // Rate My Professor bonus
    const profRating = PROFESSOR_RATINGS[sec.professor];
    if (profRating) {
      // Always give a small bonus for well-rated professors
      if (profRating.quality >= 4.0) score += 5;
      if (profRating.quality >= 4.5) score += 5;
      if (profRating.quality < 3.0) score -= 5;
      
      // Strong bonus if user explicitly wants high-rated professors
      if (preferHighRated) {
        score += Math.round((profRating.quality - 3.0) * 8); // -8 to +13.6
        if (profRating.wouldTakeAgain >= 80) score += 5;
        if (profRating.wouldTakeAgain < 50) score -= 8;
      }
    }
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  for (const day of days) {
    const daySections = selectedSections
      .filter(s => s.days.includes(day))
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    if (daySections.length === 0) continue;

    for (let i = 0; i < daySections.length - 1; i++) {
      const gap = timeToMinutes(daySections[i + 1].startTime) - timeToMinutes(daySections[i].endTime);
      const walkTime = getWalkingTime(daySections[i].building, daySections[i + 1].building);

      if (avoidWalking && walkTime > 10) score -= walkTime;
      if (gap < walkTime) score -= 30; // Can't make it in time

      // Spread preference: reward gaps
      if (preferSpread) {
        if (gap >= 30 && gap <= 90) score += 5;
        else if (gap > 90) score += 2;
      }

      // Compact preference: penalize gaps
      if (preferCompact) {
        if (gap > 30) score -= (gap - 30) / 10;
        if (gap <= 15 && walkTime <= gap) score += 8;
      }

      // Max gap enforcement
      if (maxGapMinutes && gap > maxGapMinutes) score -= 15;
    }
  }

  return score;
}

function generateSchedules(courseRequests, preferences, limit = 5) {
  const primaryRequests = courseRequests.filter(r => r.priority === 'primary');
  const backupMap = {};
  courseRequests.filter(r => r.priority === 'backup').forEach(r => {
    if (!backupMap[r.backupFor]) backupMap[r.backupFor] = [];
    backupMap[r.backupFor].push(r.courseId);
  });

  function getSectionsForCourse(courseId) {
    const course = COURSES.find(c => c.id === courseId);
    if (!course) return [];
    return course.sections.map(s => ({ ...s, courseId: course.id, courseName: course.name, credits: course.credits, dept: course.dept, rmp: PROFESSOR_RATINGS[s.professor] || null }));
  }

  const slots = primaryRequests.map(req => {
    const primary = getSectionsForCourse(req.courseId);
    const backups = (backupMap[req.courseId] || []).flatMap(bId => getSectionsForCourse(bId));
    return { primary, backups, originalCourseId: req.courseId };
  });

  const results = [];

  function backtrack(slotIdx, chosen) {
    if (results.length >= 200) return; // Cap search
    if (slotIdx === slots.length) {
      const score = scoreSchedule(chosen, preferences);
      results.push({ sections: [...chosen], score });
      return;
    }

    const slot = slots[slotIdx];
    const allOptions = [...slot.primary, ...slot.backups];

    for (const section of allOptions) {
      const hasConflict = chosen.some(c => sectionsOverlap(c, section));
      if (hasConflict) continue;

      if (preferences.avoidWalking) {
        const walkConflict = chosen.some(c => hasWalkingConflict(c, section));
        if (walkConflict) continue;
      }

      chosen.push(section);
      backtrack(slotIdx + 1, chosen);
      chosen.pop();
    }

    // Also try skipping this slot (if backups exist, schedule without it)
    if (slot.backups.length > 0) {
      backtrack(slotIdx + 1, chosen);
    }
  }

  backtrack(0, []);

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map((r, i) => ({
    rank: i + 1,
    score: r.score,
    sections: r.sections,
    totalCredits: r.sections.reduce((sum, s) => sum + (s.credits || 3), 0),
    warnings: generateWarnings(r.sections),
  }));
}

function generateWarnings(sections) {
  const warnings = [];
  for (const sec of sections) {
    if (sec.seats - sec.enrolled <= 0) {
      warnings.push(`${sec.id} (${sec.courseName}) is FULL - waitlist likely`);
    } else if (sec.seats - sec.enrolled <= 3) {
      warnings.push(`${sec.id} (${sec.courseName}) has only ${sec.seats - sec.enrolled} seat(s) left`);
    }
    // Low-rated professor warning
    const profRating = PROFESSOR_RATINGS[sec.professor];
    if (profRating && profRating.quality < 3.0) {
      warnings.push(`${sec.professor} for ${sec.id} has a low RMP rating (${profRating.quality}/5)`);
    }
  }
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  for (const day of days) {
    const daySections = sections.filter(s => s.days.includes(day))
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    for (let i = 0; i < daySections.length - 1; i++) {
      const gap = timeToMinutes(daySections[i + 1].startTime) - timeToMinutes(daySections[i].endTime);
      const walk = getWalkingTime(daySections[i].building, daySections[i + 1].building);
      if (gap < walk + 2) {
        warnings.push(`Tight transition on ${day}: ${daySections[i].id} -> ${daySections[i + 1].id} (${gap}min gap, ~${walk}min walk)`);
      }
    }
  }
  return warnings;
}


const COURSE_PACKS = {
  'first year': ['CS101', 'MATH101', 'ENG110', 'BIO101', 'PSY101'],
  'freshman': ['CS101', 'MATH101', 'ENG110', 'BIO101', 'PSY101'],
  'intro': ['CS101', 'MATH101', 'ENG110', 'BIO101', 'PSY101'],
  'beginner': ['CS101', 'MATH101', 'ENG110', 'BIO101', 'PSY101'],
  'cs major': ['CS101', 'CS201', 'MATH201', 'CS301', 'STAT301'],
  'computer science': ['CS101', 'CS201', 'MATH201', 'CS301', 'STAT301'],
  'sophomore cs': ['CS201', 'CS301', 'MATH201', 'STAT301', 'CS350'],
  'engineering': ['ENG201', 'MATH201', 'PHYS101', 'CS101', 'MATH101'],
  'pre-med': ['BIO101', 'CHEM201', 'PHYS101', 'MATH101', 'HSC200'],
  'premed': ['BIO101', 'CHEM201', 'PHYS101', 'MATH101', 'HSC200'],
  'business': ['BUS101', 'BUS220', 'MATH101', 'ENG110', 'PSY101'],
  'science': ['BIO101', 'CHEM201', 'PHYS101', 'MATH201', 'STAT301'],
  'full stack': ['CS101', 'CS201', 'CS350', 'CS301', 'MATH201'],
  'ml': ['CS400', 'CS301', 'STAT301', 'MATH201', 'CS201'],
  'machine learning': ['CS400', 'CS301', 'STAT301', 'MATH201', 'CS201'],
  'data science': ['STAT301', 'CS201', 'CS350', 'MATH201', 'CS400'],
  'easy': ['PSY101', 'ENG110', 'ART150', 'BUS101', 'BIO101'],
  'chill': ['PSY101', 'ENG110', 'ART150', 'BUS101', 'MUS100'],
  'light': ['PSY101', 'ENG110', 'ART150', 'BUS101', 'BIO101'],
};

function parseUserMessage(message, currentCourses, username) {
  const lower = message.toLowerCase();
  const response = { preferences: {}, courses: [], action: null, suggestedCourses: [], matchFriend: null, autoGenerate: false };

  if (lower.includes('morning') || lower.includes('early') || lower.match(/\bam\b/)) {
    response.preferences.preferMorning = true;
    response.preferences.preferAfternoon = false;
  }
  if (lower.includes('afternoon') || lower.includes('later') || lower.includes('sleep in') || lower.match(/\bpm\b/)) {
    response.preferences.preferAfternoon = true;
    response.preferences.preferMorning = false;
  }
  if (lower.includes('spread') || lower.includes('break') || lower.includes('gap') || lower.includes('space out')) {
    response.preferences.preferSpread = true;
    response.preferences.preferCompact = false;
  }
  if (lower.includes('compact') || lower.includes('back to back') || lower.includes('no gaps') || lower.includes('together') || lower.includes('b2b')) {
    response.preferences.preferCompact = true;
    response.preferences.preferSpread = false;
  }
  if (lower.includes('walk') || lower.includes('distance') || lower.includes('close') || lower.includes('nearby') || lower.includes('minimize walk')) {
    response.preferences.avoidWalking = true;
  }
  if (lower.includes('professor') || lower.includes('rating') || lower.includes('rmp') || lower.includes('rate my') || lower.includes('best prof') || lower.includes('good prof') || lower.includes('highly rated')) {
    response.preferences.preferHighRated = true;
  }

  const coursePattern = /\b([A-Z]{2,4}\s*\d{3})\b/gi;
  const matches = message.match(coursePattern) || [];
  response.courses = [...new Set(matches.map(m => m.replace(/\s+/g, '').toUpperCase()))];

  const wantsSetup = lower.includes('set me up') || lower.includes('set up') || lower.includes('give me') || lower.includes('pick for me') || lower.includes('choose for me') || lower.includes('suggest') || lower.includes('recommend');
  const wantsCourses = lower.includes('class') || lower.includes('course') || lower.includes('schedule');

  for (const [key, courses] of Object.entries(COURSE_PACKS)) {
    if (lower.includes(key)) {
      // Filter out courses they already have
      const newCourses = courses.filter(c => !(currentCourses || []).includes(c));
      response.suggestedCourses = newCourses;
      response.action = 'add_courses';
      response.autoGenerate = true;
      break;
    }
  }

  if (!response.suggestedCourses.length && (wantsSetup || (wantsCourses && lower.match(/\b(need|want|get|take)\b/)))) {
    if (response.courses.length === 0 && !lower.includes('list') && !lower.includes('show')) {
      // No explicit courses and no pack matched - suggest first year if they seem new
      if (lower.includes('first') || lower.includes('fresh') || lower.includes('intro') || lower.includes('beginner') || lower.includes('start')) {
        response.suggestedCourses = COURSE_PACKS['first year'].filter(c => !(currentCourses || []).includes(c));
        response.action = 'add_courses';
        response.autoGenerate = true;
      }
    }
  }

  if (response.courses.length > 0) {
    response.action = 'add_courses';
    const hasPrefs = Object.keys(response.preferences).length > 0;
    const hasEnoughCourses = (response.courses.length + (currentCourses || []).length) >= 2;
    if (hasPrefs || hasEnoughCourses) {
      response.autoGenerate = true;
    }
  }

  const friendMatchPatterns = [
    /match(?:\s+me)?\s+with\s+(\w+)/i,
    /same\s+(?:classes|schedule|courses)\s+(?:as|with)\s+(\w+)/i,
    /(?:classes|schedule|courses)\s+with\s+(\w+)/i,
    /with\s+(\w+)\s+as much/i,
    /overlap\s+with\s+(\w+)/i,
  ];
  for (const pat of friendMatchPatterns) {
    const m = message.match(pat);
    if (m) {
      const friendName = m[1].toLowerCase();
      // Find friend by display name or username
      for (const [uname, userData] of Object.entries(users)) {
        if (uname === friendName || (userData.displayName && userData.displayName.toLowerCase() === friendName)) {
          response.matchFriend = uname;
          break;
        }
      }
      break;
    }
  }

  if (lower.includes('backup') || lower.includes('back up') || lower.includes('alternative') || lower.includes('if i can\'t') || lower.includes('if not')) {
    // Don't override other actions
    if (!response.action) response.action = 'backup_mention';
  }

  if (lower.includes('generate') || lower.includes('build') || lower.includes('create') || lower.includes('optimize') || lower.includes('make my schedule') || lower.includes('do it') || lower.includes('go ahead') || lower.includes('let\'s go')) {
    response.action = 'generate';
    response.autoGenerate = true;
  }

  if (lower.includes('what courses') || lower.includes('list') || lower.includes('available') || lower.includes('show me') || lower.includes('options') || lower.includes('browse') || lower.includes('catalog')) {
    response.action = 'list';
    response.autoGenerate = false;
  }

  return response;
}

function generateAIResponse(parsed, existingPrefs, existingCourses) {
  let text = '';

  if (parsed.action === 'list') {
    text = "Here are all available courses:\n\n";
    const depts = {};
    COURSES.forEach(c => {
      if (!depts[c.dept]) depts[c.dept] = [];
      depts[c.dept].push(c);
    });
    for (const [dept, courses] of Object.entries(depts)) {
      text += `**${dept}:**\n`;
      courses.forEach(c => {
        const openSections = c.sections.filter(s => s.seats - s.enrolled > 0).length;
        text += `- ${c.id}: ${c.name} (${c.credits} cr) - ${openSections}/${c.sections.length} open\n`;
      });
      text += '\n';
    }
    return text;
  }

  if (Object.keys(parsed.preferences).length > 0) {
    const prefs = [];
    if (parsed.preferences.preferMorning) prefs.push('morning classes');
    if (parsed.preferences.preferAfternoon) prefs.push('afternoon classes');
    if (parsed.preferences.preferSpread) prefs.push('spread-out schedule');
    if (parsed.preferences.preferCompact) prefs.push('compact schedule');
    if (parsed.preferences.avoidWalking) prefs.push('minimize walking');
    if (parsed.preferences.preferHighRated) prefs.push('top-rated professors');
    text += `Preferences set: **${prefs.join(', ')}**.\n`;
  }

  if (parsed.matchFriend && users[parsed.matchFriend]) {
    const friend = users[parsed.matchFriend];
    if (friend.schedule && friend.schedule.length > 0) {
      const friendCourseIds = friend.schedule.map(s => s.courseId);
      text += `Matching with **${friend.displayName}**'s schedule. They're taking: ${friendCourseIds.map(c => `**${c}**`).join(', ')}.\n`;
      // Add friend's courses to suggested if not already in cart
      const newFromFriend = friendCourseIds.filter(c => !existingCourses.includes(c) && !parsed.courses.includes(c) && !parsed.suggestedCourses.includes(c));
      if (newFromFriend.length > 0) {
        parsed.suggestedCourses = [...parsed.suggestedCourses, ...newFromFriend].slice(0, 6);
        parsed.action = 'add_courses';
        parsed.autoGenerate = true;
      }
    } else {
      text += `**${friend.displayName}** hasn't set up their schedule yet.\n`;
    }
  }

  if (parsed.suggestedCourses.length > 0) {
    const valid = parsed.suggestedCourses.filter(cid => COURSES.find(c => c.id === cid));
    if (valid.length > 0) {
      text += `Adding: ${valid.map(cid => {
        const c = COURSES.find(co => co.id === cid);
        return `**${cid}** (${c.name})`;
      }).join(', ')}.\n`;
    }
  }

  if (parsed.courses.length > 0) {
    const found = [];
    const notFound = [];
    parsed.courses.forEach(cid => {
      const course = COURSES.find(c => c.id === cid);
      if (course) found.push(course);
      else notFound.push(cid);
    });
    if (found.length > 0) {
      text += `Added: ${found.map(c => `**${c.id}** (${c.name})`).join(', ')}.\n`;
    }
    if (notFound.length > 0) {
      text += `Couldn't find: ${notFound.join(', ')}.\n`;
    }
  }

  const totalCourses = existingCourses.length + parsed.courses.length + parsed.suggestedCourses.length;
  if (parsed.autoGenerate && totalCourses > 0) {
    text += `\nGenerating your optimal schedule now...`;
  } else if (parsed.action === 'generate' && totalCourses === 0) {
    text += `Tell me what courses you want first! Try:\n- "**Set me up with first year courses**"\n- "**I need CS101, MATH201, ENG110**"\n- "**Give me a CS major schedule**"`;
  } else if (text === '') {
    // Nothing matched - give a smart nudge
    if (existingCourses.length > 0) {
      text = `You have ${existingCourses.length} courses picked. Say **"generate"** to build your schedule, or add more courses.`;
    } else {
      text = `Try something like:\n- "**Set me up with first year courses, morning classes**"\n- "**I need CS101 and MATH201, back to back, good professors**"\n- "**Give me a CS major schedule and match with Marcus**"\n- "**List courses**" to browse`;
    }
  }

  return text;
}


app.get('/api/courses', (req, res) => {
  const enriched = COURSES.map(course => ({
    ...course,
    sections: course.sections.map(s => ({
      ...s,
      rmp: PROFESSOR_RATINGS[s.professor] || null,
    })),
  }));
  res.json(enriched);
});

app.get('/api/buildings', (req, res) => {
  res.json(BUILDINGS);
});

app.get('/api/professor/:name', (req, res) => {
  const name = req.params.name;
  const rating = PROFESSOR_RATINGS[name];
  if (!rating) return res.status(404).json({ error: 'Professor not found' });
  res.json({ name, ...rating });
});

app.get('/api/professors', (req, res) => {
  res.json(PROFESSOR_RATINGS);
});

app.post('/api/chat', (req, res) => {
  const { message, currentPreferences = {}, currentCourses = [], username = '' } = req.body;
  const parsed = parseUserMessage(message, currentCourses, username);
  const text = generateAIResponse(parsed, currentPreferences, currentCourses);
  res.json({ text, parsed });
});

app.post('/api/schedule', (req, res) => {
  const { courseRequests, preferences } = req.body;
  try {
    const schedules = generateSchedules(courseRequests || [], preferences || {});
    res.json({ schedules });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/walking-time', (req, res) => {
  const { from, to } = req.query;
  res.json({ minutes: getWalkingTime(from, to) });
});

app.post('/api/register', (req, res) => {
  const { username, displayName } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  if (users[username]) return res.status(409).json({ error: 'Username taken' });
  users[username] = { username, displayName: displayName || username, schedule: null, friends: [] };
  res.json({ user: users[username] });
});

app.post('/api/save-schedule', (req, res) => {
  const { username, schedule } = req.body;
  if (!users[username]) return res.status(404).json({ error: 'User not found' });
  users[username].schedule = schedule;
  res.json({ success: true });
});

app.post('/api/add-friend', (req, res) => {
  const { username, friendUsername } = req.body;
  if (!users[username]) return res.status(404).json({ error: 'User not found' });
  if (!users[friendUsername]) return res.status(404).json({ error: 'Friend not found' });
  if (!users[username].friends.includes(friendUsername)) {
    users[username].friends.push(friendUsername);
  }
  if (!users[friendUsername].friends.includes(username)) {
    users[friendUsername].friends.push(username);
  }
  res.json({ success: true, friends: users[username].friends });
});

app.get('/api/friends/:username', (req, res) => {
  const user = users[req.params.username];
  if (!user) return res.status(404).json({ error: 'User not found' });
  const friendData = user.friends.map(f => ({
    username: users[f]?.username,
    displayName: users[f]?.displayName,
    schedule: users[f]?.schedule,
  })).filter(Boolean);
  res.json({ friends: friendData });
});

app.get('/api/feature-ideas', (req, res) => {
  res.json({ features: [
    'Rate My Professor integration - auto-check professor ratings',
    'Waitlist auto-enroll - get notified and auto-register when a seat opens',
    'GPA impact predictor - estimate how each class affects your GPA',
    'Study group matcher - match with classmates who have similar schedules',
    'Campus map integration - visual walking routes between classes',
    'Calendar sync - export to Google Calendar / Apple Calendar',
    'Prerequisite checker - make sure you have the prereqs before adding',
    'Workload balancer - estimate weekly hours per course combination',
    'Shared class finder - find courses you and your friends can take together',
    'Schedule comparison - compare schedules with friends side by side',
    'Notification system - alert when a full class gets an opening',
    'Professor office hours overlay - see when you can visit office hours',
    'Commuter mode - optimize for specific arrival/departure times',
    'Break time optimizer - ensure lunch breaks and study blocks',
    'Multi-semester planner - plan your classes across multiple semesters',
  ]});
});

app.listen(PORT, () => {
  console.log(`\n  CourseCraft is running at http://localhost:${PORT}\n`);
});
