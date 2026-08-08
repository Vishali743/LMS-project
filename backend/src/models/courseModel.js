const firebase = require('../config/firebase');

// --- Seeding & Fallback Data lists ---
const categoriesList = [
  { name: 'Programming', description: 'Foundations of logic, algorithmic thinking, and computer programming languages.' },
  { name: 'Web Development', description: 'Build responsive websites and enterprise grade web applications.' },
  { name: 'Mobile App Development', description: 'Design and code native and cross-platform smartphone applications.' },
  { name: 'Artificial Intelligence', description: 'Neural networks, computer vision, natural language processing, and deep learning.' },
  { name: 'Machine Learning', description: 'Supervised and unsupervised models, decision trees, and predictive analysis.' },
  { name: 'Data Science', description: 'Data extraction, statistical model validation, big data engineering, and visualization.' },
  { name: 'Cyber Security', description: 'Penetration testing, encryption protocols, security policies, and network defense.' },
  { name: 'Cloud Computing', description: 'Architecting high-availability infrastructure on AWS, GCP, and Microsoft Azure.' },
  { name: 'DevOps', description: 'Continuous integration, delivery pipelines, Docker containerization, and Kubernetes.' },
  { name: 'UI/UX Design', description: 'User research methodology, wireframing, high-fidelity prototyping, and interfaces.' },
  { name: 'Graphic Design', description: 'Branding identity layouts, raster and vector graphics design, and typography.' },
  { name: 'Digital Marketing', description: 'Search engine optimization, paid advertising campaigns, and social media analytics.' },
  { name: 'Business Management', description: 'Strategic management, corporate leadership, marketing strategy, and operations.' },
  { name: 'Finance', description: 'Corporate finance structures, accounting, market analysis, and investment planning.' },
  { name: 'Communication Skills', description: 'Professional corporate speech writing, email writing, and client relations.' },
  { name: 'English Speaking', description: 'Grammar parameters, accent refinement, vocabulary extension, and verbal tests.' },
  { name: 'Placement Training', description: 'Logical reasoning, mock tests, coding round patterns, and corporate etiquette.' },
  { name: 'Aptitude', description: 'Quantitative skills, arithmetic logic, and puzzle-solving assessments.' },
  { name: 'Interview Preparation', description: 'Behavioral responses, technical whiteboard prep, and salary negotiation tactics.' },
  { name: 'Microsoft Office', description: 'Mastery of Word doc structures, PowerPoint presentations, and business modules.' },
  { name: 'Excel', description: 'Pivot tables, VLOOKUP, macro automation scripts, and financial analysis modeling.' },
  { name: 'Python', description: 'Syntax fundamentals, object-oriented concepts, and automation script structures.' },
  { name: 'Java', description: 'Core Java virtual machine parameters, spring boot REST APIs, and thread handling.' },
  { name: 'C Programming', description: 'Memory management, custom pointer parameters, and embedded device control.' },
  { name: 'C++', description: 'Standard template library, memory optimization, game structures, and pointers.' },
  { name: 'JavaScript', description: 'Asynchronous event loops, DOM processing, and modern ES6 functions.' },
  { name: 'React.js', description: 'State mechanisms, custom hooks, context management, and routing architectures.' },
  { name: 'Node.js', description: 'Express backend models, streaming file buffers, and non-blocking I/O structures.' },
  { name: 'SQL', description: 'Database query structures, relational schema design, and query optimization.' },
  { name: 'Database Management', description: 'Acid parameters, transactions locks, index tuning, and normalization.' }
];

const teachersList = [
  { name: 'Dr. Sarah Jenkins', specialization: 'Computer Science & AI', bio: 'Former Senior AI scientist at Google with 12+ years of teaching experience.' },
  { name: 'Alex Rivera', specialization: 'Full-Stack Engineering', bio: 'Lead DevOps engineer and developer with a passion for building fast web portals.' },
  { name: 'Emily Chen', specialization: 'UI/UX & Graphic Arts', bio: 'Award-winning visual designer specializing in glassmorphic mobile interfaces.' },
  { name: 'Michael Adams', specialization: 'Data Science & Finance', bio: 'Financial analyst and quantitative developer working in algorithmic trading.' },
  { name: 'David Kim', specialization: 'Cyber Security Architect', bio: 'Certified ethical hacker and defense systems designer with state security clearances.' },
  { name: 'Sophia Martinez', specialization: 'Business & Management', bio: 'Strategic corporate consultant helping startups scale workflows and operations.' },
  { name: 'Prof. Robert Hood', specialization: 'Placement & Verbal Training', bio: 'Language specialist training scholars to clear placement exams and board meetings.' },
  { name: 'Jessica Taylor', specialization: 'Cloud Architecture & DevOps', bio: 'AWS certified solutions architect specializing in serverless Kubernetes clusters.' },
  { name: 'James Wilson', specialization: 'Core Mathematics & Aptitude', bio: 'Logical reasoning expert and puzzle writer coaching thousands for tech assessments.' },
  { name: 'Daniel Lee', specialization: 'Embedded Systems & C++', bio: 'Embedded programming developer designing microcontrollers and real-time game frameworks.' }
];

const courseVideoMapping = {
  'Programming': [
    { title: 'Lecture 1: Programming Fundamentals & Problem Solving', url: 'https://www.youtube.com/embed/zOjov-2OZ0E', duration: '15:00', duration_minutes: 15, text: '### Programming Fundamentals\nLearn core logic building, algorithm design, pseudocode creation, and problem solving.' },
    { title: 'Lecture 2: Variables, Data Types & Control Flow', url: 'https://www.youtube.com/embed/bJzb-RuUcMU', duration: '20:00', duration_minutes: 20, text: '### Variables & Control Flow\nUnderstand memory allocation, data types, conditional statements, loops, and branching.' },
    { title: 'Lecture 3: Functions, Recursion & Memory Model', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', duration: '18:00', duration_minutes: 18, text: '### Modular Code & Memory\nBuild reusable function libraries, understand execution stack frames, and recursive algorithms.' }
  ],
  'Web Development': [
    { title: 'Lecture 1: HTML5 & Modern Web Architecture', url: 'https://www.youtube.com/embed/mU6anWqZJcc', duration: '14:00', duration_minutes: 14, text: '### HTML5 Architecture\nMaster semantic HTML elements, accessibility standards, document object model structure, and metadata.' },
    { title: 'Lecture 2: CSS Flexbox, Grid & Responsive Styling', url: 'https://www.youtube.com/embed/1Rs2ND1ryYc', duration: '22:00', duration_minutes: 22, text: '### CSS Layout Systems\nBuild modern responsive layouts using CSS Grid, Flexbox, media queries, and glassmorphic designs.' },
    { title: 'Lecture 3: JavaScript DOM & Asynchronous Requests', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', duration: '25:00', duration_minutes: 25, text: '### Asynchronous JavaScript\nHandle DOM events, async/await promises, REST API fetches, and dynamic UI updates.' }
  ],
  'Mobile App Development': [
    { title: 'Lecture 1: Mobile App Architecture & Mobile SDKs', url: 'https://www.youtube.com/embed/0-S5a0eXPoc', duration: '16:00', duration_minutes: 16, text: '### Mobile Development Overview\nExplore native iOS/Android frameworks, cross-platform runtimes, and mobile UI lifecycles.' },
    { title: 'Lecture 2: UI Components, State & Mobile Navigation', url: 'https://www.youtube.com/embed/gvkqT_Uke40', duration: '24:00', duration_minutes: 24, text: '### Mobile UI & Navigation\nBuild responsive mobile screens, handle stack navigation, gestures, and persistent state.' },
    { title: 'Lecture 3: Publishing & Deploying Mobile Apps', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', duration: '20:00', duration_minutes: 20, text: '### App Release & Deployment\nPrepare app bundles, manage app store credentials, test builds, and optimize performance.' }
  ],
  'Artificial Intelligence': [
    { title: 'Lecture 1: Introduction to AI & Neural Networks', url: 'https://www.youtube.com/embed/JMUxmLyrhSk', duration: '18:00', duration_minutes: 18, text: '### AI & Neural Networks\nDiscover artificial neural network architectures, perceptrons, activation functions, and gradient descent.' },
    { title: 'Lecture 2: Computer Vision & Natural Language Processing', url: 'https://www.youtube.com/embed/aircAruvnKk', duration: '26:00', duration_minutes: 26, text: '### Computer Vision & NLP\nUnderstand image classification, convolutional networks, tokenization, and transformer models.' },
    { title: 'Lecture 3: Deep Learning Models & AI Applications', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', duration: '22:00', duration_minutes: 22, text: '### Practical AI Engineering\nTrain and evaluate deep learning models using PyTorch/TensorFlow for industrial solutions.' }
  ],
  'Machine Learning': [
    { title: 'Lecture 1: Supervised & Unsupervised Machine Learning', url: 'https://www.youtube.com/embed/Gv9_4yMHFhI', duration: '17:00', duration_minutes: 17, text: '### Machine Learning Fundamentals\nUnderstand classification, regression, clustering algorithms, feature extraction, and datasets.' },
    { title: 'Lecture 2: Regression, Decision Trees & Model Training', url: 'https://www.youtube.com/embed/i_LwzRVP7bg', duration: '23:00', duration_minutes: 23, text: '### Model Training & Decision Trees\nTrain decision tree classifiers, random forests, and linear regression models on structured data.' },
    { title: 'Lecture 3: Model Validation & Hyperparameter Tuning', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', duration: '21:00', duration_minutes: 21, text: '### Model Evaluation\nPerform cross-validation, calculate precision/recall metrics, and tune model hyperparameters.' }
  ],
  'Data Science': [
    { title: 'Lecture 1: Data Science Crash Course & Ecosystem', url: 'https://www.youtube.com/embed/ua-CiDNNj3U', duration: '19:00', duration_minutes: 19, text: '### Data Science Pipeline\nMaster data ingestion, exploratory data analysis (EDA), statistical inference, and notebooks.' },
    { title: 'Lecture 2: Pandas Data Cleaning & Feature Engineering', url: 'https://www.youtube.com/embed/vmEHCJofslg', duration: '25:00', duration_minutes: 25, text: '### Data Manipulation with Pandas\nClean missing values, manipulate dataframes, engineer features, and perform group aggregations.' },
    { title: 'Lecture 3: Data Visualization & Storytelling', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', duration: '20:00', duration_minutes: 20, text: '### Data Visualization\nCreate interactive charts, dashboards, and statistical plots using Matplotlib and Seaborn.' }
  ],
  'Cyber Security': [
    { title: 'Lecture 1: Cyber Security Fundamentals & Defense', url: 'https://www.youtube.com/embed/inWWhr5tnEA', duration: '16:00', duration_minutes: 16, text: '### Cyber Security Foundations\nLearn network security protocols, threat vectors, firewalls, and defense-in-depth strategies.' },
    { title: 'Lecture 2: Penetration Testing & Encryption', url: 'https://www.youtube.com/embed/3Kq1MIfTWCE', duration: '24:00', duration_minutes: 24, text: '### Cryptography & Ethical Hacking\nUnderstand public key cryptography, SSL/TLS handshakes, vulnerability scanning, and pen testing.' },
    { title: 'Lecture 3: Security Audits & Incident Response', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', duration: '22:00', duration_minutes: 22, text: '### Incident Response Protocols\nPerform security log audits, analyze malware indicators, and execute incident remediation.' }
  ],
  'Cloud Computing': [
    { title: 'Lecture 1: Cloud Architecture & AWS Fundamentals', url: 'https://www.youtube.com/embed/M988_fsOSWo', duration: '18:00', duration_minutes: 18, text: '### Cloud Infrastructure\nExplore AWS EC2, S3, Virtual Private Clouds (VPC), IAM roles, and cloud scalability.' },
    { title: 'Lecture 2: Serverless Architecture & Cloud Security', url: 'https://www.youtube.com/embed/3hLmDS179YE', duration: '22:00', duration_minutes: 22, text: '### Serverless & Security\nDeploy serverless Lambda functions, configure API Gateways, and secure cloud assets.' },
    { title: 'Lecture 3: High-Availability Cloud Deployment', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', duration: '20:00', duration_minutes: 20, text: '### Cloud Reliability\nConfigure auto-scaling groups, load balancers, and multi-region disaster recovery.' }
  ],
  'DevOps': [
    { title: 'Lecture 1: DevOps & Docker Containerization', url: 'https://www.youtube.com/embed/Xrgk023l4lI', duration: '17:00', duration_minutes: 17, text: '### Containerization with Docker\nWrite Dockerfiles, build container images, manage multi-container apps with Docker Compose.' },
    { title: 'Lecture 2: Kubernetes Orchestration & CI/CD', url: 'https://www.youtube.com/embed/d6WC5n9G_sM', duration: '26:00', duration_minutes: 26, text: '### Kubernetes & CI/CD Pipelines\nDeploy Kubernetes pods, services, ingress controllers, and set up GitHub Actions CI/CD pipelines.' },
    { title: 'Lecture 3: Infrastructure Monitoring & Logging', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', duration: '21:00', duration_minutes: 21, text: '### Monitoring & Observability\nSet up Prometheus monitoring, Grafana metrics dashboards, and centralized log aggregation.' }
  ],
  'UI/UX Design': [
    { title: 'Lecture 1: UI/UX Design Fundamentals & Wireframing', url: 'https://www.youtube.com/embed/c9Wg6Cb_YlU', duration: '15:00', duration_minutes: 15, text: '### UI/UX Design Principles\nLearn user research techniques, information architecture, wireframing, and usability testing.' },
    { title: 'Lecture 2: Figma Masterclass & Prototyping', url: 'https://www.youtube.com/embed/jk1T0CeHwVM', duration: '25:00', duration_minutes: 25, text: '### Figma Prototyping\nDesign interactive high-fidelity prototypes, components, auto-layout frames, and design tokens.' },
    { title: 'Lecture 3: Design Systems & Glassmorphism UI', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', duration: '20:00', duration_minutes: 20, text: '### Design Systems & Visual Aesthetics\nCreate scalable UI component libraries, glassmorphic panels, and modern dark mode palettes.' }
  ]
};

if (!global.mockCourses) {
  global.mockCourses = {};
  categoriesList.slice(0, 10).forEach((cat, index) => {
    const courseId = String(10 * index + 2); // e.g. 2, 12, 22...
    const categoryVideos = courseVideoMapping[cat.name] || [
      { title: `Lecture 1: Introduction to ${cat.name}`, url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', duration: '12:00', duration_minutes: 12, text: `### Introduction\nWelcome to ${cat.name} overview.` },
      { title: `Lecture 2: ${cat.name} Applied Core Concepts`, url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '15:00', duration_minutes: 15, text: `### Core Concepts\nHands-on concepts for ${cat.name}.` },
      { title: `Lecture 3: ${cat.name} Industrial Workflows`, url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', duration: '18:00', duration_minutes: 18, text: `### Practical Applications\nReal world practice for ${cat.name}.` }
    ];

    global.mockCourses[courseId] = {
      id: courseId,
      title: `Introduction to ${cat.name}`,
      description: `Welcome to the ultimate learning module for Introduction to ${cat.name}! This course features a comprehensive, hands-on syllabus structured to transition students from core parameters to advanced, industrial-level designs.\n\nThroughout the lessons, you will learn standard optimization patterns, resolve assignment briefs, and validate your credentials via automatic quizzes. Perfect for graduates, professionals, or students wanting to expand their technical capabilities.`,
      thumbnail_url: `https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80&sig=${courseId}`,
      price: '999.00',
      instructor_id: 'mock-instructor-uid',
      instructor_name: 'Jessica Taylor',
      category_id: String(index + 1),
      category_name: cat.name,
      difficulty: 'Beginner',
      rating: 4.8,
      sections: [
        {
          id: `sec_${courseId}_1`,
          course_id: courseId,
          title: 'Module 1: Foundations & Architecture',
          sort_order: 1,
          lessons: [
            { 
              id: `les_${courseId}_1`, 
              section_id: `sec_${courseId}_1`, 
              title: categoryVideos[0].title, 
              content_type: 'video',
              content_url: categoryVideos[0].url, 
              video_url: categoryVideos[0].url, 
              duration: categoryVideos[0].duration, 
              duration_minutes: categoryVideos[0].duration_minutes,
              sort_order: 1,
              text_content: categoryVideos[0].text
            },
            { 
              id: `les_${courseId}_2`, 
              section_id: `sec_${courseId}_1`, 
              title: categoryVideos[1].title, 
              content_type: 'video',
              content_url: categoryVideos[1].url, 
              video_url: categoryVideos[1].url, 
              duration: categoryVideos[1].duration, 
              duration_minutes: categoryVideos[1].duration_minutes,
              sort_order: 2,
              text_content: categoryVideos[1].text
            }
          ]
        },
        {
          id: `sec_${courseId}_2`,
          course_id: courseId,
          title: 'Module 2: Core Workflows & Logic',
          sort_order: 2,
          lessons: [
            { 
              id: `les_${courseId}_3`, 
              section_id: `sec_${courseId}_2`, 
              title: categoryVideos[2].title, 
              content_type: 'video',
              content_url: categoryVideos[2].url, 
              video_url: categoryVideos[2].url, 
              duration: categoryVideos[2].duration, 
              duration_minutes: categoryVideos[2].duration_minutes,
              sort_order: 1,
              text_content: categoryVideos[2].text
            }
          ]
        }
      ]
    };
  });
}

function useFallback() {
  return !firebase.isInitialized();
}

async function getAllCategories() {
  return categoriesList;
}

async function getPublishedCourses(filters = {}) {
  if (useFallback()) {
    const list = Object.values(global.mockCourses || {});
    return { courses: list, totalCount: list.length };
  }

  try {
    const db = firebase.getFirestoreDb();
    let ref = db.collection('courses');
    const snapshot = await ref.get();
    const list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return { courses: list, totalCount: list.length };
  } catch (err) {
    console.error('Failed to get courses from Firestore:', err.message);
    return { courses: [], totalCount: 0 };
  }
}

async function getCoursesByInstructor(instructorId) {
  if (useFallback()) {
    let list = Object.values(global.mockCourses || {}).filter(c => String(c.instructor_id) === String(instructorId));
    if (list.length === 0 && global.mockCourses) {
      list = Object.values(global.mockCourses);
    }
    return list;
  }

  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('courses').where('instructor_id', '==', String(instructorId)).get();
    const list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (err) {
    console.error('Failed to get instructor courses from Firestore:', err.message);
    return [];
  }
}

async function getCourseById(courseId) {
  if (useFallback()) {
    return Object.values(global.mockCourses || {}).find(c => String(c.id) === String(courseId)) || null;
  }

  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('courses').doc(String(courseId)).get();
    if (!snapshot.exists) return null;
    return { id: snapshot.id, ...snapshot.data() };
  } catch (err) {
    console.error('Failed to get course by ID from Firestore:', err.message);
    return null;
  }
}

async function createCourse(data) {
  const newId = `course_${Date.now()}`;
  const courseDoc = {
    id: newId,
    title: data.title,
    description: data.description || '',
    thumbnail_url: data.thumbnail_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
    price: data.price || '0.00',
    instructor_id: String(data.instructor_id),
    instructor_name: data.instructor_name || 'Instructor',
    category_id: data.category_id || 1,
    difficulty: data.difficulty || 'Beginner',
    rating: 4.8,
    sections: []
  };

  if (useFallback()) {
    if (!global.mockCourses) global.mockCourses = {};
    global.mockCourses[newId] = courseDoc;
    return newId;
  }

  try {
    const db = firebase.getFirestoreDb();
    await db.collection('courses').doc(newId).set(courseDoc);
    return newId;
  } catch (err) {
    console.error('Failed to create course in Firestore:', err.message);
    throw err;
  }
}

async function updateCourse(courseId, data) {
  if (useFallback()) {
    const course = Object.values(global.mockCourses || {}).find(c => String(c.id) === String(courseId));
    if (course) Object.assign(course, data);
    return true;
  }

  try {
    const db = firebase.getFirestoreDb();
    await db.collection('courses').doc(String(courseId)).update(data);
    return true;
  } catch (err) {
    console.error('Failed to update course in Firestore:', err.message);
    return false;
  }
}

async function deleteCourse(courseId) {
  if (useFallback()) {
    if (global.mockCourses) {
      delete global.mockCourses[courseId];
      delete global.mockCourses[String(courseId)];
      delete global.mockCourses[Number(courseId)];
      Object.keys(global.mockCourses).forEach(key => {
        if (String(global.mockCourses[key]?.id) === String(courseId) || String(key) === String(courseId)) {
          delete global.mockCourses[key];
        }
      });
    }
    return true;
  }

  try {
    const db = firebase.getFirestoreDb();
    await db.collection('courses').doc(String(courseId)).delete();
    return true;
  } catch (err) {
    console.error('Failed to delete course in Firestore:', err.message);
    return false;
  }
}


// Curriculum Nesting handlers
async function getSectionsByCourse(courseId) {
  const course = await getCourseById(courseId);
  return course?.sections || [];
}

async function getSectionById(sectionId) {
  if (useFallback()) {
    if (global.mockSections) {
      const match = global.mockSections.find(s => String(s.id) === String(sectionId));
      if (match) return match;
    }
    if (global.mockCourses) {
      for (const course of Object.values(global.mockCourses)) {
        const match = (course.sections || []).find(s => String(s.id) === String(sectionId));
        if (match) return match;
      }
    }
    return null;
  }
  
  // Find section inside course documents
  try {
    const db = firebase.getFirestoreDb();
    const snapshot = await db.collection('courses').get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const match = data.sections?.find(s => String(s.id) === String(sectionId));
      if (match) return match;
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function createSection(courseId, data) {
  const newId = `sec_${Date.now()}`;
  const sectionObj = {
    id: newId,
    course_id: String(courseId),
    title: data.title,
    sort_order: data.sort_order || 1,
    lessons: []
  };

  if (useFallback()) {
    if (!global.mockSections) global.mockSections = [];
    global.mockSections.push(sectionObj);
    
    const course = Object.values(global.mockCourses || {}).find(c => String(c.id) === String(courseId));
    if (course) {
      if (!course.sections) course.sections = [];
      course.sections.push(sectionObj);
    }
    return newId;
  }

  try {
    const db = firebase.getFirestoreDb();
    const ref = db.collection('courses').doc(String(courseId));
    const snap = await ref.get();
    if (snap.exists) {
      const sList = snap.data().sections || [];
      sList.push(sectionObj);
      await ref.update({ sections: sList });
    }
    return newId;
  } catch (err) {
    console.error('Failed to create section in Firestore:', err.message);
    return newId;
  }
}

async function updateSection(sectionId, data) {
  if (useFallback()) {
    const sections = global.mockSections || [];
    const sec = sections.find(s => String(s.id) === String(sectionId));
    if (sec) Object.assign(sec, data);
    return true;
  }

  try {
    const db = firebase.getFirestoreDb();
    const courses = await db.collection('courses').get();
    for (const doc of courses.docs) {
      const cData = doc.data();
      const idx = cData.sections?.findIndex(s => String(s.id) === String(sectionId));
      if (idx !== undefined && idx !== -1) {
        cData.sections[idx] = { ...cData.sections[idx], ...data };
        await doc.ref.update({ sections: cData.sections });
        return true;
      }
    }
    return false;
  } catch (err) {
    return false;
  }
}

async function deleteSection(sectionId) {
  if (useFallback()) {
    if (global.mockCourses) {
      Object.values(global.mockCourses).forEach(c => {
        if (c.sections) {
          c.sections = c.sections.filter(s => String(s.id) !== String(sectionId));
        }
      });
    }
    if (global.mockSections) {
      global.mockSections = global.mockSections.filter(s => String(s.id) !== String(sectionId));
    }
    return true;
  }

  try {
    const db = firebase.getFirestoreDb();
    const courses = await db.collection('courses').get();
    for (const doc of courses.docs) {
      const cData = doc.data();
      const sList = cData.sections || [];
      const filtered = sList.filter(s => String(s.id) !== String(sectionId));
      if (sList.length !== filtered.length) {
        await doc.ref.update({ sections: filtered });
        return true;
      }
    }
    return false;
  } catch (err) {
    return false;
  }
}

// Lesson nested handlers
async function getLessonsBySection(sectionId) {
  const section = await getSectionById(sectionId);
  return section?.lessons || [];
}

async function getLessonById(lessonId) {
  if (useFallback()) {
    if (global.mockLessons) {
      const match = global.mockLessons.find(l => String(l.id) === String(lessonId));
      if (match) return match;
    }
    if (global.mockCourses) {
      for (const course of Object.values(global.mockCourses)) {
        for (const sec of (course.sections || [])) {
          const match = sec.lessons?.find(l => String(l.id) === String(lessonId));
          if (match) return match;
        }
      }
    }
    return null;
  }

  try {
    const db = firebase.getFirestoreDb();
    const courses = await db.collection('courses').get();
    for (const doc of courses.docs) {
      const cData = doc.data();
      for (const sec of (cData.sections || [])) {
        const match = sec.lessons?.find(l => String(l.id) === String(lessonId));
        if (match) return match;
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function createLesson(sectionId, data) {
  const newId = `les_${Date.now()}`;
  const lessonObj = {
    id: newId,
    section_id: String(sectionId),
    title: data.title,
    content_type: data.contentType || data.content_type || 'video',
    content_url: data.contentUrl || data.content_url || data.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    video_url: data.contentUrl || data.content_url || data.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    text_content: data.textContent || data.text_content || '### Lecture Overview\nWelcome to this comprehensive video lecture!',
    duration_minutes: data.durationMinutes || data.duration_minutes || 15,
    sort_order: data.sortOrder || data.sort_order || 1
  };

  if (useFallback()) {
    if (!global.mockLessons) global.mockLessons = [];
    global.mockLessons.push(lessonObj);
    const section = await getSectionById(sectionId);
    if (section) {
      if (!section.lessons) section.lessons = [];
      section.lessons.push(lessonObj);
    }
    return newId;
  }

  try {
    const db = firebase.getFirestoreDb();
    const courses = await db.collection('courses').get();
    for (const doc of courses.docs) {
      const cData = doc.data();
      const idx = cData.sections?.findIndex(s => String(s.id) === String(sectionId));
      if (idx !== undefined && idx !== -1) {
        if (!cData.sections[idx].lessons) cData.sections[idx].lessons = [];
        cData.sections[idx].lessons.push(lessonObj);
        await doc.ref.update({ sections: cData.sections });
        return newId;
      }
    }
    return newId;
  } catch (err) {
    return newId;
  }
}

async function updateLesson(lessonId, data) {
  if (useFallback()) {
    return true;
  }

  try {
    const db = firebase.getFirestoreDb();
    const courses = await db.collection('courses').get();
    for (const doc of courses.docs) {
      const cData = doc.data();
      let updated = false;
      for (let sec of (cData.sections || [])) {
        const idx = sec.lessons?.findIndex(l => String(l.id) === String(lessonId));
        if (idx !== undefined && idx !== -1) {
          sec.lessons[idx] = { ...sec.lessons[idx], ...data };
          updated = true;
        }
      }
      if (updated) {
        await doc.ref.update({ sections: cData.sections });
        return true;
      }
    }
    return false;
  } catch (err) {
    return false;
  }
}

async function deleteLesson(lessonId) {
  if (useFallback()) {
    if (global.mockCourses) {
      Object.values(global.mockCourses).forEach(c => {
        if (c.sections) {
          c.sections.forEach(sec => {
            if (sec.lessons) {
              sec.lessons = sec.lessons.filter(l => String(l.id) !== String(lessonId));
            }
          });
        }
      });
    }
    if (global.mockLessons) {
      global.mockLessons = global.mockLessons.filter(l => String(l.id) !== String(lessonId));
    }
    return true;
  }

  try {
    const db = firebase.getFirestoreDb();
    const courses = await db.collection('courses').get();
    for (const doc of courses.docs) {
      const cData = doc.data();
      let updated = false;
      for (let sec of (cData.sections || [])) {
        const initialLength = sec.lessons?.length || 0;
        if (sec.lessons) {
          sec.lessons = sec.lessons.filter(l => String(l.id) !== String(lessonId));
          if (sec.lessons.length !== initialLength) {
            updated = true;
          }
        }
      }
      if (updated) {
        await doc.ref.update({ sections: cData.sections });
        return true;
      }
    }
    return false;
  } catch (err) {
    return false;
  }
}


async function getScholarsByInstructor(instructorId) {
  if (useFallback()) {
    return [];
  }

  try {
    const db = firebase.getFirestoreDb();
    const coursesSnapshot = await db.collection('courses').where('instructor_id', '==', String(instructorId)).get();
    const courseIds = [];
    const courseMap = {};
    coursesSnapshot.forEach(doc => {
      courseIds.push(doc.id);
      courseMap[doc.id] = doc.data().title;
    });

    if (courseIds.length === 0) return [];

    const enrollSnapshot = await db.collection('enrollments').get();
    const scholarsList = [];

    for (const doc of enrollSnapshot.docs) {
      const eData = doc.data();
      if (courseIds.includes(String(eData.course_id))) {
        const student = await db.collection('users').doc(String(eData.student_id)).get();
        const sData = student.exists ? student.data() : { display_name: 'Student', email: '' };

        const progDoc = await db.collection('progress').doc(`${eData.student_id}_${eData.course_id}`).get();
        const pData = progDoc.exists ? progDoc.data() : { completed_lessons: [] };

        scholarsList.push({
          student_name: sData.display_name,
          email: sData.email,
          course_id: eData.course_id,
          course_title: courseMap[eData.course_id] || 'Syllabus Course',
          enrolled_at: eData.enrolled_at,
          progress: pData.completed_lessons?.length ? Math.min(100, Math.round((pData.completed_lessons.length / 6) * 100)) : 0,
          quiz_score: 85,
          certificate_status: eData.completed_at ? 'Issued' : 'In Progress',
          completed_lessons: pData.completed_lessons?.length || 0,
          total_lessons: 6,
          completed_quizzes: 0,
          total_quizzes: 1,
          completed_assignments: 0,
          total_assignments: 1,
          current_week: 1,
          last_active: new Date(eData.enrolled_at).toLocaleDateString()
        });
      }
    }
    return scholarsList;
  } catch (err) {
    console.error('Failed to get scholars list for instructor:', err.message);
    return [];
  }
}

module.exports = {
  getAllCategories,
  getPublishedCourses,
  getCoursesByInstructor,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getSectionsByCourse,
  getCourseSections: getSectionsByCourse,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  getLessonsBySection,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getScholarsByInstructor
};
