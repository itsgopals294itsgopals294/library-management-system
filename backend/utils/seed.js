import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Book from '../models/Book.js';
import BookCopy from '../models/BookCopy.js';
import Circulation from '../models/Circulation.js';
import Reservation from '../models/Reservation.js';
import Fine from '../models/Fine.js';
import Review from '../models/Review.js';
import Settings from '../models/Settings.js';
import Category from '../models/Category.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/athena_library_db';

const seedDatabase = async () => {
  try {
    await mongoose.connect(connUri);
    console.log(`[Seed] Connected to MongoDB at ${connUri}`);

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Book.deleteMany(),
      BookCopy.deleteMany(),
      Circulation.deleteMany(),
      Reservation.deleteMany(),
      Fine.deleteMany(),
      Review.deleteMany(),
      Settings.deleteMany(),
      Category.deleteMany(),
      AuditLog.deleteMany(),
    ]);
    console.log('[Seed] Cleared existing collections.');

    // 1. Seed Settings
    const settings = await Settings.create({
      libraryName: 'Athena Central Academic Library',
      institutionName: 'Institute of Advanced Science & Technology',
      defaultLoanDaysStudent: 14,
      defaultLoanDaysFaculty: 30,
      gracePeriodDays: 1,
      fineRatePerDay: 2.0,
      maxFinePerBook: 50.0,
      maxBooksStudent: 4,
      maxBooksFaculty: 10,
      maxRenewalsAllowed: 2,
      holdExpirationHours: 48,
      contactEmail: 'contact@athena.edu',
      contactPhone: '+1 (555) 789-0123',
      address: '742 University Ave, Knowledge Park, Campus B',
    });
    console.log('[Seed] Settings configured.');

    // 2. Seed Categories
    const categories = await Category.insertMany([
      { name: 'Computer Science', code: 'CS', deweyClass: '004', color: '#3b82f6', description: 'Software engineering, algorithms, architectures' },
      { name: 'Artificial Intelligence', code: 'AI', deweyClass: '006.3', color: '#8b5cf6', description: 'Machine learning, neural networks, LLMs' },
      { name: 'Data Science', code: 'DS', deweyClass: '005.7', color: '#10b981', description: 'Big data analytics, statistics, databases' },
      { name: 'Physics & Quantum', code: 'PHYS', deweyClass: '530', color: '#f59e0b', description: 'Quantum computing, mechanics, astrophysics' },
      { name: 'Mathematics', code: 'MATH', deweyClass: '510', color: '#ec4899', description: 'Discrete math, calculus, linear algebra' },
      { name: 'Literature & Philosophy', code: 'LIT', deweyClass: '800', color: '#6366f1', description: 'Classic fiction, philosophy of mind, ethics' },
    ]);
    console.log(`[Seed] ${categories.length} Categories created.`);

    // 3. Seed Users
    const admin = await User.create({
      name: 'Dr. Eleanor Vance',
      email: 'admin@athena.edu',
      password: 'Admin@123',
      role: 'admin',
      patronType: 'faculty',
      membershipId: 'ADM-2026-1001',
      maxBooksAllowed: 20,
      maxBorrowDays: 60,
      phone: '+1 555-0100',
      address: 'Faculty Quarters #4B',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    });

    const librarian = await User.create({
      name: 'Marcus Sterling',
      email: 'librarian@athena.edu',
      password: 'Lib@123',
      role: 'librarian',
      patronType: 'faculty',
      membershipId: 'LIB-2026-2002',
      maxBooksAllowed: 20,
      maxBorrowDays: 60,
      phone: '+1 555-0101',
      address: 'Staff Block #12',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    });

    const student = await User.create({
      name: 'Sophia Patel',
      email: 'student@athena.edu',
      password: 'Student@123',
      role: 'member',
      patronType: 'student',
      membershipId: 'MEM-2026-3003',
      maxBooksAllowed: 4,
      maxBorrowDays: 14,
      phone: '+1 555-0102',
      address: 'West Residence Hall #304',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    });

    const faculty = await User.create({
      name: 'Prof. Julian Thorne',
      email: 'faculty@athena.edu',
      password: 'Faculty@123',
      role: 'member',
      patronType: 'faculty',
      membershipId: 'MEM-2026-4004',
      maxBooksAllowed: 10,
      maxBorrowDays: 30,
      phone: '+1 555-0103',
      address: 'Science Complex, Department of Computer Science',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    });

    const student2 = await User.create({
      name: 'David Kim',
      email: 'david@athena.edu',
      password: 'Student@123',
      role: 'member',
      patronType: 'student',
      membershipId: 'MEM-2026-5005',
      maxBooksAllowed: 4,
      maxBorrowDays: 14,
      phone: '+1 555-0104',
      address: 'North Quad Dorms #112',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    });
    console.log('[Seed] Users seeded (Admin, Librarian, Student, Faculty, Student 2).');

    // 4. Seed Books & Physical Copies
    const booksData = [
      {
        title: 'Designing Data-Intensive Applications',
        subtitle: 'The Big Ideas Behind Reliable, Scalable, and Maintainable Systems',
        authors: ['Martin Kleppmann'],
        isbn: '9781449373320',
        publisher: "O'Reilly Media",
        publishedYear: 2017,
        edition: '1st Edition',
        category: 'Computer Science',
        tags: ['Distributed Systems', 'Databases', 'Architecture', 'Streaming'],
        description: 'Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability. In this practical and comprehensive guide, author Martin Kleppmann helps you navigate this diverse landscape.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/P/1449373321.01._SX400_SCLZZZZZZZ_.jpg',
        pageCount: 616,
        format: 'Paperback',
        deweyDecimal: '005.74',
        callNumber: 'QA76.9.D3 K54 2017',
        featured: true,
        digitalResource: {
          hasDigitalCopy: true,
          pdfUrl: 'https://raw.githubusercontent.com/ept/ddia-code-samples/master/README.md',
          previewSnippet: 'Chapter 1: Reliable, Scalable, and Maintainable Applications. Most software applications are data-intensive...',
        },
        copies: [
          { barcode: 'BC-3320-1-1001', location: { building: 'Main Campus', floor: 'Floor 2', aisle: 'CS-01', shelf: 'S-03', callNumber: 'QA76.9.D3 K54' }, status: 'Issued', condition: 'Good', price: 42.0 },
          { barcode: 'BC-3320-2-1002', location: { building: 'Main Campus', floor: 'Floor 2', aisle: 'CS-01', shelf: 'S-03', callNumber: 'QA76.9.D3 K54' }, status: 'Available', condition: 'New', price: 42.0 },
          { barcode: 'BC-3320-3-1003', location: { building: 'Main Campus', floor: 'Floor 2', aisle: 'CS-01', shelf: 'S-03', callNumber: 'QA76.9.D3 K54' }, status: 'Available', condition: 'Good', price: 42.0 },
        ],
      },
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        subtitle: 'A Handbook of Agile Software Craftsmanship',
        authors: ['Robert C. Martin'],
        isbn: '9780132350884',
        publisher: 'Prentice Hall',
        publishedYear: 2008,
        edition: '1st Edition',
        category: 'Computer Science',
        tags: ['Best Practices', 'Refactoring', 'Agile', 'Java'],
        description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn’t have to be that way.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/P/0132350882.01._SX400_SCLZZZZZZZ_.jpg',
        pageCount: 464,
        format: 'Paperback',
        deweyDecimal: '005.1',
        callNumber: 'QA76.76.D47 M37 2008',
        featured: true,
        digitalResource: {
          hasDigitalCopy: true,
          pdfUrl: '',
          previewSnippet: 'Meaningful Names: Names are everywhere in software. We name our variables, our functions, our arguments, classes, and packages...',
        },
        copies: [
          { barcode: 'BC-5088-1-2001', location: { building: 'Main Campus', floor: 'Floor 2', aisle: 'CS-02', shelf: 'S-01', callNumber: 'QA76.76.D47' }, status: 'Issued', condition: 'Good', price: 38.0 },
          { barcode: 'BC-5088-2-2002', location: { building: 'Main Campus', floor: 'Floor 2', aisle: 'CS-02', shelf: 'S-01', callNumber: 'QA76.76.D47' }, status: 'Available', condition: 'Worn', price: 38.0 },
        ],
      },
      {
        title: 'Deep Learning',
        subtitle: 'Adaptive Computation and Machine Learning series',
        authors: ['Ian Goodfellow', 'Yoshua Bengio', 'Aaron Courville'],
        isbn: '9780262035613',
        publisher: 'MIT Press',
        publishedYear: 2016,
        edition: '1st Edition',
        category: 'Artificial Intelligence',
        tags: ['Neural Networks', 'PyTorch', 'Math', 'AI'],
        description: 'An introduction to a broad range of topics in deep learning, covering mathematical and conceptual background, deep learning techniques used in industry, and research perspectives.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/P/0262035618.01._SX400_SCLZZZZZZZ_.jpg',
        pageCount: 800,
        format: 'Hardcover',
        deweyDecimal: '006.3',
        callNumber: 'Q325.5 .G66 2016',
        featured: true,
        digitalResource: {
          hasDigitalCopy: true,
          pdfUrl: 'https://www.deeplearningbook.org/',
          previewSnippet: 'Applied Math and Machine Learning Basics: Linear algebra, probability theory, numerical computation...',
        },
        copies: [
          { barcode: 'BC-5613-1-3001', location: { building: 'Main Campus', floor: 'Floor 3', aisle: 'AI-01', shelf: 'S-05', callNumber: 'Q325.5 .G66' }, status: 'Reserved', condition: 'New', price: 75.0 },
          { barcode: 'BC-5613-2-3002', location: { building: 'Main Campus', floor: 'Floor 3', aisle: 'AI-01', shelf: 'S-05', callNumber: 'Q325.5 .G66' }, status: 'Available', condition: 'Good', price: 75.0 },
        ],
      },
      {
        title: 'Introduction to Algorithms',
        subtitle: 'CLRS - Comprehensive Guide to Algorithms',
        authors: ['Thomas H. Cormen', 'Charles E. Leiserson', 'Ronald L. Rivest', 'Clifford Stein'],
        isbn: '9780262046305',
        publisher: 'MIT Press',
        publishedYear: 2022,
        edition: '4th Edition',
        category: 'Computer Science',
        tags: ['Algorithms', 'Data Structures', 'Sorting', 'Graphs'],
        description: 'A comprehensive update of the leading algorithms text, with new material on matchings in bipartite graphs, online algorithms, machine learning, and other topics.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/P/026204630X.01._SX400_SCLZZZZZZZ_.jpg',
        pageCount: 1312,
        format: 'Hardcover',
        deweyDecimal: '005.1',
        callNumber: 'QA76.6 .I5858 2022',
        featured: true,
        digitalResource: {
          hasDigitalCopy: false,
        },
        copies: [
          { barcode: 'BC-4630-1-4001', location: { building: 'Main Campus', floor: 'Floor 2', aisle: 'CS-03', shelf: 'S-02', callNumber: 'QA76.6' }, status: 'Available', condition: 'New', price: 89.0 },
          { barcode: 'BC-4630-2-4002', location: { building: 'Main Campus', floor: 'Floor 2', aisle: 'CS-03', shelf: 'S-02', callNumber: 'QA76.6' }, status: 'Available', condition: 'Good', price: 89.0 },
          { barcode: 'BC-4630-3-4003', location: { building: 'Main Campus', floor: 'Floor 2', aisle: 'CS-03', shelf: 'S-02', callNumber: 'QA76.6' }, status: 'Available', condition: 'Good', price: 89.0 },
        ],
      },
      {
        title: 'Structure and Interpretation of Computer Programs',
        subtitle: 'SICP - JavaScript Edition',
        authors: ['Harold Abelson', 'Gerald Jay Sussman'],
        isbn: '9780262543231',
        publisher: 'MIT Press',
        publishedYear: 2022,
        edition: 'JS Edition',
        category: 'Computer Science',
        tags: ['Functional Programming', 'Lisp', 'Abstraction', 'Compilers'],
        description: 'A new version of the classic computer science text that offers gentle exploration of fundamental concepts using modern web language paradigms.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/P/0262543234.01._SX400_SCLZZZZZZZ_.jpg',
        pageCount: 650,
        format: 'Paperback',
        deweyDecimal: '005.13',
        callNumber: 'QA76.6 .A255 2022',
        featured: false,
        digitalResource: { hasDigitalCopy: true, pdfUrl: '', previewSnippet: 'Building Abstractions with Functions...' },
        copies: [
          { barcode: 'BC-4323-1-5001', location: { building: 'Main Campus', floor: 'Floor 2', aisle: 'CS-04', shelf: 'S-01', callNumber: 'QA76.6' }, status: 'Available', condition: 'Good', price: 35.0 },
        ],
      },
      {
        title: 'Quantum Computation and Quantum Information',
        subtitle: '10th Anniversary Edition',
        authors: ['Michael A. Nielsen', 'Isaac L. Chuang'],
        isbn: '9781107002173',
        publisher: 'Cambridge University Press',
        publishedYear: 2010,
        edition: '10th Anniversary Edition',
        category: 'Physics & Quantum',
        tags: ['Quantum Circuits', 'Qubits', 'Entanglement', 'Physics'],
        description: 'One of the most cited books in physics of all time, this comprehensive textbook describes such remarkable phenomena as fast quantum algorithms, quantum teleportation, quantum cryptography and quantum error-correction.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/P/1107002176.01._SX400_SCLZZZZZZZ_.jpg',
        pageCount: 702,
        format: 'Hardcover',
        deweyDecimal: '004.1',
        callNumber: 'QA76.889 .N54 2010',
        featured: true,
        digitalResource: { hasDigitalCopy: false },
        copies: [
          { barcode: 'BC-0217-1-6001', location: { building: 'Science Wing', floor: 'Floor 4', aisle: 'PH-01', shelf: 'S-02', callNumber: 'QA76.889' }, status: 'Available', condition: 'New', price: 95.0 },
          { barcode: 'BC-0217-2-6002', location: { building: 'Science Wing', floor: 'Floor 4', aisle: 'PH-01', shelf: 'S-02', callNumber: 'QA76.889' }, status: 'Under Maintenance', condition: 'Damaged', price: 95.0 },
        ],
      },
      {
        title: 'Thinking, Fast and Slow',
        subtitle: 'The Groundbreaking International Bestseller on Human Judgement',
        authors: ['Daniel Kahneman'],
        isbn: '9780374533557',
        publisher: 'Farrar, Straus and Giroux',
        publishedYear: 2011,
        edition: 'Reprint',
        category: 'Literature & Philosophy',
        tags: ['Psychology', 'Behavioral Economics', 'Cognition', 'Decision Making'],
        description: 'In the international bestseller, Thinking, Fast and Slow, Daniel Kahneman, the renowned psychologist and winner of the Nobel Prize in Economics, takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/P/0374533555.01._SX400_SCLZZZZZZZ_.jpg',
        pageCount: 512,
        format: 'Paperback',
        deweyDecimal: '153.4',
        callNumber: 'BF441 .K238 2011',
        featured: false,
        digitalResource: { hasDigitalCopy: true, pdfUrl: '', previewSnippet: 'Two Systems: The mental operations of System 1 and System 2...' },
        copies: [
          { barcode: 'BC-3355-1-7001', location: { building: 'Main Campus', floor: 'Floor 1', aisle: 'LIT-02', shelf: 'S-04', callNumber: 'BF441' }, status: 'Available', condition: 'Good', price: 20.0 },
          { barcode: 'BC-3355-2-7002', location: { building: 'Main Campus', floor: 'Floor 1', aisle: 'LIT-02', shelf: 'S-04', callNumber: 'BF441' }, status: 'Available', condition: 'Good', price: 20.0 },
        ],
      },
    ];

    const seededBooks = [];
    const seededCopies = [];

    for (const bData of booksData) {
      const { copies, ...bookFields } = bData;
      const totalCopies = copies.length;
      const availableCopies = copies.filter((c) => c.status === 'Available').length;

      const book = await Book.create({
        ...bookFields,
        totalCopies,
        availableCopies,
        rating: { average: 4.8, count: 12 },
      });
      seededBooks.push(book);

      let copyIndex = 1;
      for (const c of copies) {
        const copy = await BookCopy.create({
          book: book._id,
          barcode: c.barcode,
          copyNumber: copyIndex++,
          status: c.status,
          condition: c.condition,
          location: c.location,
          price: c.price,
        });
        seededCopies.push(copy);
      }
    }
    console.log(`[Seed] ${seededBooks.length} Books and ${seededCopies.length} Physical Copies created.`);

    // 5. Create Active Circulations (Loans)
    // Book 1 (Designing Data-Intensive Applications) Copy 1 issued to Student (Active, Due in 5 days)
    const dueDate1 = new Date();
    dueDate1.setDate(dueDate1.getDate() + 5);

    const issueDate1 = new Date();
    issueDate1.setDate(issueDate1.getDate() - 9);

    const loan1 = await Circulation.create({
      transactionId: 'TXN-2026-8801',
      book: seededBooks[0]._id,
      copy: seededCopies[0]._id, // BC-3320-1-1001 (status: Issued)
      member: student._id,
      issuedBy: librarian._id,
      issueDate: issueDate1,
      dueDate: dueDate1,
      status: 'active',
      renewCount: 0,
    });

    // Book 2 (Clean Code) Copy 1 issued to Student 2 (OVERDUE by 4 days to demonstrate overdue fine mechanics!)
    const issueDate2 = new Date();
    issueDate2.setDate(issueDate2.getDate() - 18);

    const dueDate2 = new Date();
    dueDate2.setDate(dueDate2.getDate() - 4); // 4 days overdue!

    const loan2 = await Circulation.create({
      transactionId: 'TXN-2026-8802',
      book: seededBooks[1]._id,
      copy: seededCopies[3]._id, // BC-5088-1-2001 (status: Issued)
      member: student2._id,
      issuedBy: librarian._id,
      issueDate: issueDate2,
      dueDate: dueDate2,
      status: 'active',
      renewCount: 1,
    });

    // Past Returned Loan
    const loan3 = await Circulation.create({
      transactionId: 'TXN-2026-8803',
      book: seededBooks[3]._id,
      copy: seededCopies[6]._id,
      member: faculty._id,
      issuedBy: librarian._id,
      returnedTo: librarian._id,
      issueDate: new Date('2026-09-01'),
      dueDate: new Date('2026-10-01'),
      returnDate: new Date('2026-09-28'),
      status: 'returned',
      initialCondition: 'New',
      returnCondition: 'Good',
    });
    console.log('[Seed] Circulations (Active, Overdue, Returned) seeded.');

    // 6. Seed Reservations (Hold Queue)
    // Deep Learning has a copy (BC-5613-1-3001) reserved for Sophia Patel (Ready for pickup!)
    const pickupExpiry = new Date();
    pickupExpiry.setHours(pickupExpiry.getHours() + 36);

    const res1 = await Reservation.create({
      book: seededBooks[2]._id,
      member: student._id,
      queuePosition: 1,
      status: 'ready_for_pickup',
      allocatedCopy: seededCopies[5]._id, // BC-5613-1-3001
      notifiedAt: new Date(),
      pickupExpiryDate: pickupExpiry,
    });

    // Another student waiting in queue for Designing Data-Intensive Applications
    const res2 = await Reservation.create({
      book: seededBooks[0]._id,
      member: faculty._id,
      queuePosition: 1,
      status: 'waiting',
      requestDate: new Date(),
    });
    console.log('[Seed] Hold Reservations seeded.');

    // 7. Seed Fines
    // Fine 1: Unpaid Overdue fine for Student 2 ($8.00 - 4 days overdue * $2/day)
    await Fine.create({
      fineId: 'FINE-2026-9001',
      member: student2._id,
      circulation: loan2._id,
      type: 'overdue',
      amount: 8.0,
      daysOverdue: 4,
      status: 'unpaid',
      paymentMethod: 'pending',
    });

    // Fine 2: Paid Fine ($10.00) from Student with receipt
    await Fine.create({
      fineId: 'FINE-2026-9002',
      member: student._id,
      type: 'overdue',
      amount: 6.0,
      daysOverdue: 3,
      status: 'paid',
      paymentMethod: 'upi',
      paymentDate: new Date('2026-10-10'),
      collectedBy: librarian._id,
      receiptNumber: 'RCP-2026-100882',
    });
    console.log('[Seed] Fine ledger seeded with paid and unpaid fines.');

    // 8. Seed Reviews
    await Review.create({
      book: seededBooks[0]._id,
      member: student._id,
      rating: 5,
      comment: 'Essential reading for any software engineer dealing with distributed systems and databases. Explains transactions, replication, and partitioning with absolute clarity.',
      isApproved: true,
    });

    await Review.create({
      book: seededBooks[1]._id,
      member: faculty._id,
      rating: 5,
      comment: 'Timeless principles for writing readable, maintainable code. Used this as required reading in my Advanced Software Engineering course.',
      isApproved: true,
    });
    console.log('[Seed] Book reviews seeded.');

    // 9. Initial Audit Logs
    await AuditLog.create({
      action: 'SYSTEM_INITIALIZED',
      actor: admin._id,
      actorName: admin.name,
      actorRole: admin.role,
      targetType: 'Settings',
      targetId: settings._id,
      details: { message: 'Database initialized with demo catalog and assets.' },
    });
    console.log('[Seed] Audit logs recorded.');

    console.log('\n======================================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY! ');
    console.log('======================================================');
    console.log('DEMO ACCOUNTS:');
    console.log(' Admin:     admin@athena.edu     / Admin@123');
    console.log(' Librarian: librarian@athena.edu / Lib@123');
    console.log(' Student:   student@athena.edu   / Student@123');
    console.log(' Faculty:   faculty@athena.edu   / Faculty@123');
    console.log(' Student 2: david@athena.edu     / Student@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
