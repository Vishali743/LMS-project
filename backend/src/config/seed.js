const mysql = require('mysql2/promise');

// 30 categories specified
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

// Mock teachers
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
  { name: 'Daniel Lee', specialization: 'Embedded Systems & C++', bio: 'Systems programming developer designing microcontrollers and real-time game frameworks.' }
];

// Unsplash images mapped to categories
function getThumbnail(catName, courseId = 0) {
  const query = catName.toLowerCase();
  let basePhotoId = '';
  
  if (query.includes('react')) {
    basePhotoId = 'photo-1633356122544-f134324a6cee'; // React logo with dashboard UI
  } else if (query.includes('node')) {
    basePhotoId = 'photo-1508921912186-1d1a45ebb3c1'; // Backend server illustration
  } else if (query.includes('python')) {
    basePhotoId = 'photo-1526374965328-7f61d4dc18c5'; // Python coding matrix
  } else if (query.includes('java')) {
    basePhotoId = 'photo-1555066931-4365d14bab8c'; // Java programming
  } else if (query.includes('c programming')) {
    basePhotoId = 'photo-1488590528505-98d2b5aba04b'; // C language coding
  } else if (query.includes('c++')) {
    basePhotoId = 'photo-1607799279861-4dd421887fb3'; // C++ development
  } else if (query.includes('javascript')) {
    basePhotoId = 'photo-1579468118864-1b9ea3c0db4a'; // HTML CSS JS scripting
  } else if (query.includes('web development')) {
    basePhotoId = 'photo-1498050108023-c5249f4df085'; // HTML, CSS, JavaScript website design
  } else if (query.includes('mobile')) {
    basePhotoId = 'photo-1512941937669-90a1b58e7e9c'; // Android/iOS app screens
  } else if (query.includes('machine learning')) {
    basePhotoId = 'photo-1527474305487-b87b222841cc'; // AI models and graphs
  } else if (query.includes('artificial intelligence') || query.includes('ai')) {
    basePhotoId = 'photo-1677442136019-21780efad99a'; // Neural networks and AI
  } else if (query.includes('data science')) {
    basePhotoId = 'photo-1551288049-bebda4e38f71'; // Charts, analytics, datasets
  } else if (query.includes('cyber') || query.includes('security')) {
    basePhotoId = 'photo-1550751827-4bd374c3f58b'; // Shield, lock, hacker protection
  } else if (query.includes('cloud')) {
    basePhotoId = 'photo-1544197150-b99a580bb7a8'; // Cloud servers
  } else if (query.includes('devops')) {
    basePhotoId = 'photo-1618401471353-b98aedd07871'; // CI/CD pipelines
  } else if (query.includes('ui/ux') || query.includes('ui') || query.includes('ux')) {
    basePhotoId = 'photo-1586717791821-3f44a563fa4c'; // Figma and wireframes
  } else if (query.includes('graphic design')) {
    basePhotoId = 'photo-1626785774573-4b799315345d'; // Photoshop and design tools
  } else if (query.includes('marketing')) {
    basePhotoId = 'photo-1460925895917-afdab827c52f'; // Social media and SEO
  } else if (query.includes('business')) {
    basePhotoId = 'photo-1454165804606-c3d57bc86b40'; // Office meeting and business analytics
  } else if (query.includes('finance')) {
    basePhotoId = 'photo-1611974789855-9c2a0a7236a3'; // Stock market and finance dashboard
  } else if (query.includes('excel')) {
    basePhotoId = 'photo-1586075010923-2dd45e9b2d4f'; // Microsoft Excel spreadsheet
  } else if (query.includes('office') || query.includes('microsoft')) {
    basePhotoId = 'photo-1531403009284-440f080d1e12'; // Microsoft Office
  } else if (query.includes('speaking') || query.includes('english')) {
    basePhotoId = 'photo-1503676260728-1c00da094a0b'; // Classroom and communication
  } else if (query.includes('placement')) {
    basePhotoId = 'photo-1521791136368-1a869295d8f1'; // Interview and resume
  } else if (query.includes('aptitude')) {
    basePhotoId = 'photo-1606326608606-aa0b62935f2b'; // Logical reasoning
  } else if (query.includes('interview')) {
    basePhotoId = 'photo-1507679799987-c73779587ccf'; // Interview and resume
  } else if (query.includes('communication')) {
    basePhotoId = 'photo-1557804506-669a67965ba0'; // Presentation and teamwork
  } else if (query.includes('programming')) {
    basePhotoId = 'photo-1517694712202-14dd9538aa97'; // Coding laptop, code editor
  } else if (query.includes('sql')) {
    basePhotoId = 'photo-1544383835-bda2bc66a55d'; // Database tables
  } else if (query.includes('database') || query.includes('mysql')) {
    basePhotoId = 'photo-1601134467661-3d775b999c8b'; // Database server
  } else {
    basePhotoId = 'photo-1517694712202-14dd9538aa97'; // Default laptop code
  }
  
  return `https://images.unsplash.com/${basePhotoId}?w=600&auto=format&fit=crop&q=80&sig=${courseId}`;
}

function getPreviewVideo(catName) {
  const query = catName.toLowerCase();
  
  if (query.includes('python')) {
    return 'https://www.youtube.com/embed/t8pPdKYpowI';
  }
  if (query.includes('react')) {
    return 'https://www.youtube.com/embed/Ke90Tje7VS0';
  }
  if (query.includes('node')) {
    return 'https://www.youtube.com/embed/TlB_eWDSMt4';
  }
  if (query.includes('express')) {
    return 'https://www.youtube.com/embed/SccSCuHhOw0';
  }
  if (query.includes('javascript')) {
    return 'https://www.youtube.com/embed/W6NZfCO5SIk';
  }
  if (query.includes('java')) {
    return 'https://www.youtube.com/embed/A74TOX803D0';
  }
  if (query.includes('c programming')) {
    return 'https://www.youtube.com/embed/KJgsSFOSQv0';
  }
  if (query.includes('c++')) {
    return 'https://www.youtube.com/embed/vLnPwxZdW4Y';
  }
  if (query.includes('mysql') || query.includes('sql') || query.includes('database')) {
    return 'https://www.youtube.com/embed/HXV3zeQKqGY';
  }
  if (query.includes('machine learning')) {
    return 'https://www.youtube.com/embed/GwIo3gDZUtQ';
  }
  if (query.includes('artificial intelligence') || query.includes('ai')) {
    return 'https://www.youtube.com/embed/JMUxmLtto50';
  }
  if (query.includes('data science')) {
    return 'https://www.youtube.com/embed/ua-CiDNNj30';
  }
  if (query.includes('cyber') || query.includes('security')) {
    return 'https://www.youtube.com/embed/3Kq1MIfTWCE';
  }
  if (query.includes('cloud')) {
    return 'https://www.youtube.com/embed/3hLmDS179YE';
  }
  if (query.includes('devops')) {
    return 'https://www.youtube.com/embed/hQcFE0RD0cQ';
  }
  if (query.includes('ui/ux') || query.includes('ui') || query.includes('ux') || query.includes('graphic') || query.includes('design')) {
    return 'https://www.youtube.com/embed/c9Wg6A_eWIU';
  }
  if (query.includes('marketing')) {
    return 'https://www.youtube.com/embed/k5Ypef2y1q8';
  }
  if (query.includes('excel') || query.includes('office')) {
    return 'https://www.youtube.com/embed/rwbho0CgEAE';
  }
  if (query.includes('business') || query.includes('management')) {
    return 'https://www.youtube.com/embed/42E_2Cg_4oQ';
  }
  if (query.includes('finance')) {
    return 'https://www.youtube.com/embed/6i2j1kP8Wnk';
  }
  if (query.includes('speaking') || query.includes('english')) {
    return 'https://www.youtube.com/embed/oK0uB1mC-F4';
  }
  if (query.includes('placement') || query.includes('interview')) {
    return 'https://www.youtube.com/embed/9Gooz_4KqWw';
  }
  if (query.includes('aptitude')) {
    return 'https://www.youtube.com/embed/XvtB35yVn3g';
  }
  if (query.includes('communication')) {
    return 'https://www.youtube.com/embed/HAnw168huqA';
  }
  
  return 'https://www.youtube.com/embed/ok-plXXHlWw';
}


const templates = [
  'Introduction to {cat}',
  'Advanced {cat} Mastery',
  '{cat} for Beginners',
  'Complete {cat} Bootcamp: Zero to Hero',
  'Practical {cat} Applications',
  'Essential {cat} Techniques',
  'Modern {cat} Design & Architecture',
  '{cat} Implementation & Case Studies',
  'The Art of {cat}',
  'Crash Course: {cat} in 3 Hours',
  'Industrial {cat} Patterns',
  '{cat} for Professionals',
  'Next-Gen {cat} Strategies',
  '{cat} Foundations & Best Practices',
  'Building Real-World Projects with {cat}',
  '{cat} Interview Preparation Masterclass',
  'Ultimate Guide to {cat}'
];

function getEducationalVideo(catName, index) {
  const query = catName.toLowerCase();
  
  if (query.includes('react')) {
    const list = [
      'https://www.youtube.com/embed/Ke90Tje7VS0',
      'https://www.youtube.com/embed/SqcY0GlETPk',
      'https://www.youtube.com/embed/bMknfKXIFA8',
      'https://www.youtube.com/embed/DLX62G4lc44'
    ];
    return list[index % list.length];
  }
  if (query.includes('node') || query.includes('express')) {
    const list = [
      'https://www.youtube.com/embed/TlB_eWDSMt4',
      'https://www.youtube.com/embed/f2EqECyiAVA',
      'https://www.youtube.com/embed/Oe421EPjeBE',
      'https://www.youtube.com/embed/yEHCfGv0mYM'
    ];
    return list[index % list.length];
  }
  if (query.includes('python')) {
    const list = [
      'https://www.youtube.com/embed/t8pPdKYpowI',
      'https://www.youtube.com/embed/rfscVS0vtbw',
      'https://www.youtube.com/embed/8DvywoWv6fI',
      'https://www.youtube.com/embed/yGbS864N25U'
    ];
    return list[index % list.length];
  }
  if (query.includes('sql') || query.includes('database') || query.includes('mysql')) {
    const list = [
      'https://www.youtube.com/embed/HXV3zeQKqGY',
      'https://www.youtube.com/embed/7S_tz1z_5bA',
      'https://www.youtube.com/embed/Cz3Wc3c1t0c',
      'https://www.youtube.com/embed/5OdVJbNCSso'
    ];
    return list[index % list.length];
  }
  if (query.includes('javascript') || query.includes('programming')) {
    const list = [
      'https://www.youtube.com/embed/W6NZfCO5SIk',
      'https://www.youtube.com/embed/hdI2bqOjy3c',
      'https://www.youtube.com/embed/v2tJ3nzXh8I',
      'https://www.youtube.com/embed/2qDywOS7VAc'
    ];
    return list[index % list.length];
  }
  if (query.includes('machine learning') || query.includes('artificial intelligence') || query.includes('ai')) {
    const list = [
      'https://www.youtube.com/embed/GwIo3gDZUtQ',
      'https://www.youtube.com/embed/JMUxmLtto50',
      'https://www.youtube.com/embed/i_LwzRVP7bg',
      'https://www.youtube.com/embed/aircAruvnKk'
    ];
    return list[index % list.length];
  }
  if (query.includes('cyber') || query.includes('security')) {
    const list = [
      'https://www.youtube.com/embed/3Kq1MIfTWCE',
      'https://www.youtube.com/embed/U_P23SqJaDc',
      'https://www.youtube.com/embed/nzj7Wg469gA',
      'https://www.youtube.com/embed/6mFlG_dD95A'
    ];
    return list[index % list.length];
  }
  if (query.includes('devops') || query.includes('cloud')) {
    const list = [
      'https://www.youtube.com/embed/hQcFE0RD0cQ',
      'https://www.youtube.com/embed/3hLmDS179YE',
      'https://www.youtube.com/embed/X48VuDVv0do',
      'https://www.youtube.com/embed/s_o8dwzRlu4'
    ];
    return list[index % list.length];
  }
  if (query.includes('ui/ux') || query.includes('design') || query.includes('graphic')) {
    const list = [
      'https://www.youtube.com/embed/c9Wg6A_eWIU',
      'https://www.youtube.com/embed/zHAa-likxxY',
      'https://www.youtube.com/embed/YqQx75OPRa0',
      'https://www.youtube.com/embed/5XmlaJfe7x0'
    ];
    return list[index % list.length];
  }
  
  const defaultList = [
    'https://www.youtube.com/embed/ok-plXXHlWw',
    'https://www.youtube.com/embed/t8pPdKYpowI',
    'https://www.youtube.com/embed/HXV3zeQKqGY',
    'https://www.youtube.com/embed/W6NZfCO5SIk'
  ];
  return defaultList[index % defaultList.length];
}

async function seedDatabase(pool) {
  try {
    console.log('Seeding categories...');
    const catMap = {}; // name -> id
    
    for (const cat of categoriesList) {
      const [res] = await pool.query(
        'INSERT INTO categories (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
        [cat.name, cat.description]
      );
      catMap[cat.name] = res.insertId;
    }
    
    console.log('Seeding teachers...');
    const teacherIds = [];
    for (let i = 0; i < teachersList.length; i++) {
      const teacher = teachersList[i];
      const email = `instructor${i + 1}@skeinlms.com`;
      const firebaseUid = `mock-teacher-uid-${i + 1}`;
      
      // 1. Insert user
      const [userRes] = await pool.query(
        'INSERT INTO users (firebase_uid, email, role) VALUES (?, ?, "instructor") ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
        [firebaseUid, email]
      );
      const userId = userRes.insertId;
      teacherIds.push(userId);
      
      // 2. Insert teacher profile
      await pool.query(
        'INSERT INTO teachers (user_id, display_name, photo_url, biography, specialization, is_approved) VALUES (?, ?, ?, ?, ?, TRUE) ON DUPLICATE KEY UPDATE display_name=VALUES(display_name)',
        [
          userId,
          teacher.name,
          `https://i.pravatar.cc/150?img=${i + 10}`,
          teacher.bio,
          teacher.specialization
        ]
      );
    }
    
    console.log('Generating 500+ courses...');
    let coursesSeededCount = 0;
    
    // We will generate 17 courses for each of the 30 categories: 30 * 17 = 510 courses!
    for (const cat of categoriesList) {
      const catId = catMap[cat.name];
      
      for (let t = 0; t < templates.length; t++) {
        const title = templates[t].replace(/{cat}/g, cat.name);
        const instructorId = teacherIds[(coursesSeededCount) % teacherIds.length];
        
        const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

        const isFree = Math.random() < 0.2; // 20% Free
        let price = 0;
        if (!isFree) {
          const rand = Math.random();
          if (rand < 0.15) {
            price = [5999, 6999, 7999][Math.floor(Math.random() * 3)];
          } else if (difficulty === 'Beginner') {
            price = [999, 1199, 1299, 1499][Math.floor(Math.random() * 4)];
          } else if (difficulty === 'Intermediate') {
            price = [1999, 2199, 2499, 2999][Math.floor(Math.random() * 4)];
          } else {
            price = [3499, 3999, 4499, 4999][Math.floor(Math.random() * 4)];
          }
        }
        
        const duration = Math.floor(Math.random() * 30) + 6; // 6 to 36 hours
        const ratings = [4.1, 4.3, 4.5, 4.6, 4.7, 4.8, 4.9];
        const rating = ratings[Math.floor(Math.random() * ratings.length)];
        const enrollments = Math.floor(Math.random() * 8000) + 120; // 120 to 8120 students
        const language = Math.random() < 0.9 ? 'English' : ['Spanish', 'French', 'Japanese'][Math.floor(Math.random() * 3)];
        
        const outcomes = JSON.stringify([
          `Master all standard concepts inside ${cat.name}`,
          `Build production-grade projects demonstrating ${cat.name} skills`,
          `Earn a verifiable certificate of completion for professional recognition`
        ]);
        
        const prerequisites = difficulty === 'Beginner' 
          ? 'None! Ideal for complete newcomers.'
          : `Basic familiarity with core systems and ${cat.name} fundamentals.`;
          
        const shortDesc = `Master the absolute essentials of ${cat.name}. Build career-ready portfolios under professional guidance.`;
        const longDesc = `Welcome to the ultimate learning module for ${title}! This course features a comprehensive, hands-on syllabus structured to transition students from core parameters to advanced, industrial-level designs.\n\nThroughout the lessons, you will learn standard optimization patterns, resolve assignment briefs, and validate your credentials via automatic quizzes. Perfect for graduates, professionals, or students wanting to expand their technical capabilities.`;

        // Insert course
        const [courseRes] = await pool.query(
          `INSERT INTO courses (
            instructor_id, title, short_description, description, thumbnail_url, preview_video_url, category_id,
            price, difficulty_level, duration_hours, language, certificate_available,
            learning_outcomes, prerequisites, rating_avg, enrollment_count, is_published
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?, ?, TRUE)`,
          [
            instructorId,
            title,
            shortDesc,
            longDesc,
            getThumbnail(cat.name, coursesSeededCount + 1),
            getPreviewVideo(cat.name),
            catId,
            price,
            difficulty,
            duration,
            language,
            outcomes,
            prerequisites,
            rating,
            enrollments
          ]
        );
        const courseId = courseRes.insertId;
        
        // Insert 3 sections (Modules) for the course
        const modules = ['Module 1: Foundations & Architecture', 'Module 2: Core Workflows & Logic', 'Module 3: Advanced Implementation & Deployments'];
        for (let m = 0; m < modules.length; m++) {
          const [secRes] = await pool.query(
            'INSERT INTO sections (course_id, title, sort_order) VALUES (?, ?, ?)',
            [courseId, modules[m], m + 1]
          );
          const secId = secRes.insertId;
          
          // Insert 3 lessons (course_videos) per section
          const lessons = [
            `Lecture ${m*3 + 1}: Overview, Fundamental Concepts & Workspace Setup`,
            `Lecture ${m*3 + 2}: Direct Technical Exercise & Live Code Implementation`,
            `Lecture ${m*3 + 3}: Advanced Features, Performance Tuning & Summary`
          ];
          for (let l = 0; l < lessons.length; l++) {
            await pool.query(
              'INSERT INTO course_videos (section_id, title, video_url, duration_minutes, sort_order) VALUES (?, ?, ?, ?, ?)',
              [
                secId,
                lessons[l],
                getEducationalVideo(cat.name, m * 3 + l),
                Math.floor(Math.random() * 20) + 10, // 10 to 30 mins
                l + 1
              ]
            );
          }

          // Seed a quiz for this section
          const [quizRes] = await pool.query(
            'INSERT INTO quizzes (course_id, section_id, title, max_score) VALUES (?, ?, ?, ?)',
            [courseId, secId, `Assessment Quiz: ${modules[m]}`, 30]
          );
          const quizId = quizRes.insertId;

          // Add 3 multiple choice questions for the quiz
          const questionTexts = [
            `Which of the following is a primary core design pattern in ${cat.name}?`,
            `What is the standard best practice for performance optimization in ${cat.name}?`,
            `True or False: Using the default configurations in ${cat.name} leads to thread safety leaks.`
          ];
          
          for (let q = 0; q < questionTexts.length; q++) {
            const [qRes] = await pool.query(
              'INSERT INTO quiz_questions (quiz_id, question_text, question_type, points) VALUES (?, ?, ?, ?)',
              [quizId, questionTexts[q], q === 2 ? 'true_false' : 'multiple_choice', 10]
            );
            const questionId = qRes.insertId;

            if (q === 2) {
              await pool.query('INSERT INTO question_options (question_id, option_text, is_correct) VALUES (?, ?, ?)', [questionId, 'True', 0]);
              await pool.query('INSERT INTO question_options (question_id, option_text, is_correct) VALUES (?, ?, ?)', [questionId, 'False (Correct)', 1]);
            } else {
              await pool.query('INSERT INTO question_options (question_id, option_text, is_correct) VALUES (?, ?, ?)', [questionId, 'Option A: High latency fallback', 0]);
              await pool.query('INSERT INTO question_options (question_id, option_text, is_correct) VALUES (?, ?, ?)', [questionId, 'Option B: Thread safety caching (Correct)', 1]);
              await pool.query('INSERT INTO question_options (question_id, option_text, is_correct) VALUES (?, ?, ?)', [questionId, 'Option C: Unsynchronized global storage', 0]);
              await pool.query('INSERT INTO question_options (question_id, option_text, is_correct) VALUES (?, ?, ?)', [questionId, 'Option D: Ad-hoc local polling', 0]);
            }
          }

          // Seed an assignment for this section
          await pool.query(
            'INSERT INTO assignments (section_id, title, description, max_points) VALUES (?, ?, ?, ?)',
            [secId, `Module Assignment Brief: ${modules[m]}`, `Implement a custom execution script illustrating the fundamentals taught inside ${modules[m]}. Pack your source files in a ZIP archive and submit with code outlines feedback logs.`, 100]
          );
        }
        
        coursesSeededCount++;
      }
    }
    
    console.log(`Successfully seeded ${coursesSeededCount} courses, categories, and mock instructors!`);
  } catch (err) {
    console.error('Seeding database error:', err);
    throw err;
  }
}

async function seedFirestoreDatabase(db) {
  try {
    const courseRef = db.collection('courses');
    const snapshot = await courseRef.limit(1).get();
    if (!snapshot.empty) {
      console.log('Firestore already contains seeded courses. Skipping seeder.');
      return;
    }

    console.log('Seeding Cloud Firestore with default course catalog...');
    
    // Seed default courses
    const defaultCourses = [
      {
        id: 'course_web_dev',
        title: 'Introduction to Web Development',
        description: 'Welcome to the ultimate learning module for Introduction to Web Development! This course features a comprehensive, hands-on syllabus structured to transition students from core parameters to advanced, industrial-level designs.',
        thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
        price: '999.00',
        instructor_id: 'mock-instructor-uid',
        instructor_name: 'Jessica Taylor',
        category_id: '2',
        difficulty: 'Beginner',
        rating: 4.8,
        sections: [
          {
            id: 'sec_web_1',
            title: 'Module 1: Foundations & Architecture',
            sort_order: 1,
            lessons: [
              { id: 'les_web_1', title: 'Lecture 1: HTML5 Semantics & DOM Tree Structure', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '12:30', sort_order: 1 },
              { id: 'les_web_2', title: 'Lecture 2: CSS Grid layout & responsive viewport parameters', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '18:45', sort_order: 2 }
            ]
          },
          {
            id: 'sec_web_2',
            title: 'Module 2: Core Workflows & Logic',
            sort_order: 2,
            lessons: [
              { id: 'les_web_3', title: 'Lecture 3: Asynchronous Javascript event loops & AJAX calls', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '22:15', sort_order: 1 }
            ]
          }
        ]
      },
      {
        id: 'course_react_js',
        title: 'React.js Core Concepts Masterclass',
        description: 'Master component design models, custom hooks development, virtual DOM optimizations, and state lifecycle synchronization.',
        thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
        price: '1499.00',
        instructor_id: 'mock-instructor-uid',
        instructor_name: 'Alex Rivera',
        category_id: '30',
        difficulty: 'Advanced',
        rating: 4.9,
        sections: [
          {
            id: 'sec_react_1',
            title: 'Module 1: Virtual DOM & Hooks parameters',
            sort_order: 1,
            lessons: [
              { id: 'les_react_1', title: 'Lecture 1: Functional components lifecycle hooks', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '15:20', sort_order: 1 }
            ]
          }
        ]
      }
    ];

    for (const c of defaultCourses) {
      await db.collection('courses').doc(c.id).set(c);
      
      // Seed default assignments for the course sections
      for (const sec of c.sections) {
        const assId = `ass_${c.id}_${sec.id}`;
        await db.collection('assignments').doc(assId).set({
          id: assId,
          course_id: c.id,
          section_id: sec.id,
          title: `Assignment: ${sec.title}`,
          description: `Complete the practical exercises for section "${sec.title}" and submit your archive summary file.`,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          max_points: 100,
          instructions: 'Upload file or write submission text.'
        });
      }
    }

    // Seed default mock instructors/users profiles
    const users = [
      { firebase_uid: 'mock-student-uid', email: 'student@skeinlms.com', role: 'student', display_name: 'Demo Student', photo_url: '', student_code: 'STU-128934' },
      { firebase_uid: 'mock-instructor-uid', email: 'instructor@skeinlms.com', role: 'instructor', display_name: 'Demo Instructor', photo_url: '' },
      { firebase_uid: 'mock-admin-uid', email: 'admin@skeinlms.com', role: 'admin', display_name: 'Demo Admin', photo_url: '' }
    ];

    for (const u of users) {
      await db.collection('users').doc(u.firebase_uid).set(u);
      if (u.role === 'student') {
        await db.collection('students').doc(u.firebase_uid).set({ user_id: u.firebase_uid, display_name: u.display_name, student_code: u.student_code });
      } else if (u.role === 'instructor') {
        await db.collection('teachers').doc(u.firebase_uid).set({ user_id: u.firebase_uid, display_name: u.display_name });
      }
    }

    console.log('Cloud Firestore database seeded successfully!');
  } catch (err) {
    console.error('Failed to seed Cloud Firestore:', err.message);
  }
}

module.exports = { seedDatabase, seedFirestoreDatabase };
