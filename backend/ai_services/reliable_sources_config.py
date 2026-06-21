# -*- coding: utf-8 -*-
"""
📚 EDUUP GLOBAL EXAM ACADEMY — RELIABLE EDUCATIONAL SOURCES CONFIGURATION
Comprehensive list of reliable educational sources for each subject
to ensure high-quality and trustworthy content.
"""

from typing import Dict, List


class ReliableSourcesConfig:
    """Configuration for reliable educational sources"""
    
    # Reliable educational domains for each subject
    RELIABLE_DOMAINS = {
        "matematika": [
            "khanacademy.org",
            "mathsisfun.com",
            "purplemath.com",
            "nctm.org",
            "artofproblemsolving.com",
            "brilliant.org",
            "math.stackexchange.com",
            "wolfram.com",
            "desmos.com",
            "geogebra.org",
            "mit.edu",
            "stanford.edu",
            "coursera.org",
            "edx.org"
        ],
        "fizika": [
            "physics.info",
            "hyperphysics.phy-astr.gsu.edu",
            "physicsclassroom.com",
            "khanacademy.org",
            "mit.edu",
            "nasa.gov",
            "physics.stackexchange.com",
            "cern.ch",
            "nobelprize.org",
            "aps.org",
            "aip.org",
            "iop.org",
            "phy.org",
            "science.nasa.gov"
        ],
        "kimyo": [
            "chem.libretexts.org",
            "royalsociety.org",
            "acs.org",
            "khanacademy.org",
            "rsc.org",
            "chemistry.stackexchange.com",
            "pubchem.ncbi.nlm.nih.gov",
            "nist.gov",
            "iupac.org",
            "britannica.com",
            "chemistryworld.com",
            "nature.com",
            "sciencedirect.com"
        ],
        "biologiya": [
            "biologycorner.com",
            "khanacademy.org",
            "nature.com",
            "nih.gov",
            "ncbi.nlm.nih.gov",
            "biology.stackexchange.com",
            "cell.com",
            "sciencedirect.com",
            "plos.org",
            "britannica.com",
            "nationalgeographic.com",
            "smithsonianmag.com",
            "sciencemag.org"
        ],
        "ona_tili": [
            "uzbekistan.uz",
            "edu.uz",
            "znanio.uz",
            "til.uz",
            "uztranslat.uz",
            "academy.uz",
            "mehrfarzand.uz",
            "uzbek.uz"
        ],
        "ingliz_tili": [
            "britishcouncil.org",
            "cambridge.org",
            "oxfordlearnersdictionaries.com",
            "duolingo.com",
            "bbc.co.uk",
            "merriam-webster.com",
            "dictionary.com",
            "engvid.com",
            "esl.org",
            "ets.org",
            "ielts.org",
            "toefl.org"
        ],
        "tarix": [
            "britannica.com",
            "history.com",
            "nationalgeographic.com",
            "smithsonianmag.com",
            "history.stackexchange.com",
            "jstor.org",
            "archive.org",
            "loc.gov",
            "britishmuseum.org",
            "metmuseum.org",
            "unesco.org",
            "worldhistory.org"
        ],
        "geografiya": [
            "nationalgeographic.com",
            "britannica.com",
            "cia.gov",
            "worldbank.org",
            "un.org",
            "geography.stackexchange.com",
            "usgs.gov",
            "noaa.gov",
            "nasa.gov",
            "earthobservatory.nasa.gov",
            "worldatlas.com",
            "geography.name"
        ],
        "rus_tili": [
            "britishcouncil.org",
            "cambridge.org",
            "duolingo.com",
            "bbc.co.uk",
            "russianforfree.com",
            "learnrussian.rt.com"
        ],
        "nemis_tili": [
            "goethe.de",
            "deutsch-lernen.com",
            "dw.com",
            "germanveryeasy.com",
            "german.net",
            "lingolia.com",
            "duolingo.com"
        ],
        "fransuz_tili": [
            "france.fr",
            "alliancefr.org",
            "tv5monde.com",
            "french.about.com",
            "lawlessfrench.com",
            "duolingo.com",
            "bbc.co.uk"
        ],
        "ispan_tili": [
            "cervantes.es",
            "studyspanish.com",
            "spanishdict.com",
            "duolingo.com",
            "bbc.co.uk",
            "spanish.about.com"
        ],
        "arab_tili": [
            "arabic.desert-sky.net",
            "madinaharabic.com",
            "arabiconline.eu",
            "duolingo.com",
            "bbc.co.uk"
        ],
        "xitoy_tili": [
            "chinese-tools.com",
            "chinesepod.com",
            "duolingo.com",
            "bbc.co.uk",
            "hsk.org"
        ],
        "yapon_tili": [
            "tanos.co.uk",
            "japanese-lesson.com",
            "duolingo.com",
            "japanesepod101.com",
            "nhk.or.jp"
        ],
        "koreys_tili": [
            "talktomeinkorean.com",
            "howtostudykorean.com",
            "duolingo.com",
            "korean.go.kr"
        ],
        "informatika": [
            "khanacademy.org",
            "code.org",
            "w3schools.com",
            "mit.edu",
            "stanford.edu",
            "coursera.org",
            "edx.org",
            "freecodecamp.org",
            "geeksforgeeks.org"
        ],
        "iqtisodiyot": [
            "khanacademy.org",
            "mit.edu",
            "harvard.edu",
            "worldbank.org",
            "imf.org",
            "oecd.org",
            "investopedia.com",
            "economist.com"
        ],
        "falsafa": [
            "plato.stanford.edu",
            "mit.edu",
            "harvard.edu",
            "britannica.com",
            "iep.utm.edu",
            "philosophybasics.com"
        ],
        "psixologiya": [
            "apa.org",
            "nih.gov",
            "psychologytoday.com",
            "verywellmind.com",
            "khanacademy.org",
            "mit.edu",
            "stanford.edu"
        ],
        "sanat_tarixi": [
            "britannica.com",
            "smarthistory.org",
            "metmuseum.org",
            "khanacademy.org",
            "louvre.fr",
            "britishmuseum.org"
        ],
        "musiqa": [
            "britannica.com",
            "khanacademy.org",
            "musictheory.net",
            "teoria.com",
            "conservatory.org"
        ],
        "jismoniy_tarbiya": [
            "who.int",
            "cdc.gov",
            "khanacademy.org",
            "britannica.com",
            "mayoclinic.org"
        ],
        "astronomiya": [
            "nasa.gov",
            "esa.int",
            "khanacademy.org",
            "britannica.com",
            "noaa.gov",
            "skyandtelescope.org"
        ],
        "geologiya": [
            "usgs.gov",
            "britannica.com",
            "khanacademy.org",
            "geology.com",
            "nature.com",
            "sciencedirect.com"
        ]
    }
    
    # YouTube channels for educational content
    RELIABLE_YOUTUBE_CHANNELS = {
        "matematika": [
            "Khan Academy",
            "3Blue1Brown",
            "Numberphile",
            "Professor Leonard",
            "PatrickJMT",
            "Eddie Woo",
            "Mathologer",
            "MIT OpenCourseWare",
            "Dr Peyam",
            "The Organic Chemistry Tutor",
            "Brian McLogan",
            "Khan Academy in Uzbek"
        ],
        "fizika": [
            "Khan Academy",
            "Physics Girl",
            "Veritasium",
            "MinutePhysics",
            "MIT OpenCourseWare",
            "PBS Space Time",
            "Sciencium",
            "Sixty Symbols",
            "Physics Videos by Eugene Khutoryansky",
            "3Blue1Brown",
            "The Science Asylum",
            "Looking Glass Universe"
        ],
        "kimyo": [
            "Khan Academy",
            "Tyler DeWitt",
            "CrashCourse",
            "The Organic Chemistry Tutor",
            "Professor Dave Explains",
            "NileRed",
            "Periodic Videos",
            "Chemistry with Dr. N",
            "Leah4sci",
            "Freesciencelessons",
            "Tyler DeWitt in Uzbek"
        ],
        "biologiya": [
            "Khan Academy",
            "CrashCourse",
            "Amoeba Sisters",
            "Kurzgesagt",
            "MIT OpenCourseWare",
            "Shomu's Biology",
            "Professor Dave Explains",
            "The Amoeba Sisters",
            "Biology with Dr. N",
            "Nucleus Medical Media",
            "Osmosis",
            "Armando Hasudungan"
        ],
        "ona_tili": [
            "O'zbek tili darslari",
            "Til o'rganish",
            "Uzbek Language Channel",
            "Learn Uzbek",
            "O'zbekiston telekanallari"
        ],
        "ingliz_tili": [
            "BBC Learning English",
            "British Council",
            "English with Lucy",
            "Learn English with TV Series",
            "Rachel's English",
            "EnglishClass101",
            "EngVid",
            "TED-Ed",
            "Learn English with Papa Teach Me",
            "Woodward English"
        ],
        "tarix": [
            "CrashCourse",
            "Khan Academy",
            "TED-Ed",
            "History Matters",
            "The Great War",
            "Extra History",
            "Biographics",
            "History Channel",
            "National Geographic",
            "Smithsonian Channel"
        ],
        "geografiya": [
            "National Geographic",
            "Kurzgesagt",
            "CrashCourse",
            "Geography Now",
            "TED-Ed",
            "SciShow",
            "RealLifeLore",
            "Wendover Productions",
            "Bright Side",
            "Geography Hub"
        ],
        "rus_tili": [
            "Russian with Maxim",
            "RussianPod101",
            "Real Russian Club",
            "Learn Russian with RussianPod101",
            "Easy Russian"
        ],
        "nemis_tili": [
            "German with Jenny",
            "Easy German",
            "Learn German with Anja",
            "Get Germanized",
            "GermanPod101"
        ],
        "fransuz_tili": [
            "French with Alexa",
            "Learn French with FrenchPod101",
            "Francais avec Pierre",
            "French Sounds",
            "Comme une Francaise"
        ],
        "ispan_tili": [
            "SpanishDict",
            "Butterfly Spanish",
            "Learn Spanish with SpanishPod101",
            "SpanishPod101",
            "Dreaming Spanish"
        ],
        "arab_tili": [
            "Arabic with Maha",
            "Learn Arabic with ArabicPod101",
            "ArabicPod101",
            "Easy Arabic",
            "Arabic for Beginners"
        ],
        "xitoy_tili": [
            "ChinesePod101",
            "Learn Chinese with ChinesePod101",
            "Yoyo Chinese",
            "ChineseClass101",
            "Mandarin Chinese"
        ],
        "yapon_tili": [
            "JapanesePod101",
            "Learn Japanese with JapanesePod101",
            "Japanese Ammo with Misa",
            "Japanese with Yuta",
            "JapaneseClass101"
        ],
        "koreys_tili": [
            "Talk To Me In Korean",
            "KoreanClass101",
            "Learn Korean with KoreanClass101",
            "Go! Billy Korean",
            "Korean Unnie"
        ],
        "informatika": [
            "Khan Academy Computing",
            "CS50",
            "Programming with Mosh",
            "freeCodeCamp",
            "The Net Ninja",
            "Traversy Media",
            "Tech With Tim"
        ],
        "iqtisodiyot": [
            "Khan Academy Economics",
            "CrashCourse Economics",
            "Marginal Revolution University",
            "Economics Explained",
            "Financial Times"
        ],
        "falsafa": [
            "CrashCourse Philosophy",
            "Philosophy Tube",
            "School of Life",
            "Wireless Philosophy",
            "Khan Academy Philosophy"
        ],
        "psixologiya": [
            "CrashCourse Psychology",
            "Psychology in Seattle",
            "Khan Academy Psychology",
            "The School of Life",
            "Psych2Go"
        ],
        "sanat_tarixi": [
            "Smarthistory",
            "Khan Academy Art History",
            "The Art Assignment",
            "CrashCourse Art History",
            "Metropolitan Museum of Art"
        ],
        "musiqa": [
            "Khan Academy Music",
            "Rick Beato",
            "Adam Neely",
            "12tone",
            "Vinheteiro"
        ],
        "jismoniy_tarbiya": [
            "Khan Academy Health",
            "CrashCourse Anatomy",
            "Osmosis",
            "Kurzgesagt",
            "TED-Ed Health"
        ],
        "astronomiya": [
            "Khan Academy Astronomy",
            "CrashCourse Astronomy",
            "PBS Space Time",
            "SciShow Space",
            "NASA"
        ],
        "geologiya": [
            "Khan Academy Earth Science",
            "CrashCourse Geology",
            "GeoLogica",
            "Science with Sam",
            "Geology Hub"
        ]
    }
    
    # Reliable educational institutions and organizations
    RELIABLE_INSTITUTIONS = {
        "matematika": [
            "Massachusetts Institute of Technology (MIT)",
            "Stanford University",
            "Harvard University",
            "Princeton University",
            "California Institute of Technology (Caltech)",
            "University of Cambridge",
            "University of Oxford",
            "ETH Zurich",
            "National Institute of Standards and Technology (NIST)"
        ],
        "fizika": [
            "Massachusetts Institute of Technology (MIT)",
            "California Institute of Technology (Caltech)",
            "Stanford University",
            "Harvard University",
            "Princeton University",
            "CERN",
            "NASA",
            "American Physical Society (APS)",
            "Institute of Physics (IOP)"
        ],
        "kimyo": [
            "Massachusetts Institute of Technology (MIT)",
            "Stanford University",
            "Harvard University",
            "California Institute of Technology (Caltech)",
            "Royal Society of Chemistry (RSC)",
            "American Chemical Society (ACS)",
            "International Union of Pure and Applied Chemistry (IUPAC)",
            "National Institute of Standards and Technology (NIST)"
        ],
        "biologiya": [
            "Massachusetts Institute of Technology (MIT)",
            "Harvard University",
            "Stanford University",
            "National Institutes of Health (NIH)",
            "National Center for Biotechnology Information (NCBI)",
            "Nature Publishing Group",
            "Science Magazine",
            "Cell Press",
            "Public Library of Science (PLOS)"
        ],
        "ona_tili": [
            "O'zbekiston Milliy Universiteti",
            "Toshkent Davlat Pedagogika Universiteti",
            "O'zbekiston Davlat Jahon Tillari Universiteti",
            "O'zbekiston Respublikasi Ta'lim Vazirligi",
            "O'zbekiston Yozuvchilar Uyushmasi"
        ],
        "ingliz_tili": [
            "British Council",
            "Cambridge Assessment English",
            "Educational Testing Service (ETS)",
            "International English Language Testing System (IELTS)",
            "Test of English as a Foreign Language (TOEFL)",
            "University of Cambridge",
            "University of Oxford"
        ],
        "tarix": [
            "Harvard University",
            "Stanford University",
            "Yale University",
            "Princeton University",
            "University of Cambridge",
            "University of Oxford",
            "Smithsonian Institution",
            "Library of Congress",
            "British Museum"
        ],
        "geografiya": [
            "National Geographic Society",
            "Royal Geographical Society",
            "American Geographical Society",
            "United Nations",
            "World Bank",
            "Central Intelligence Agency (CIA)",
            "United States Geological Survey (USGS)",
            "National Aeronautics and Space Administration (NASA)"
        ],
        "rus_tili": [
            "Pushkin State Russian Language Institute",
            "Moscow State University",
            "Saint Petersburg State University",
            "Russian Language Center"
        ],
        "nemis_tili": [
            "Goethe-Institut",
            "DAAD",
            "University of Munich",
            "University of Berlin"
        ],
        "fransuz_tili": [
            "Alliance Francaise",
            "Sorbonne University",
            "University of Paris",
            "French Ministry of Education"
        ],
        "ispan_tili": [
            "Instituto Cervantes",
            "University of Madrid",
            "University of Barcelona",
            "Spanish Ministry of Education"
        ],
        "arab_tili": [
            "University of Cairo",
            "University of Damascus",
            "Arabic Language Academy",
            "King Saud University"
        ],
        "xitoy_tili": [
            "Beijing Language and Culture University",
            "Peking University",
            "Fudan University",
            "Hanban (Confucius Institute Headquarters)"
        ],
        "yapon_tili": [
            "Japan Foundation",
            "University of Tokyo",
            "Kyoto University",
            "Japanese Language School"
        ],
        "koreys_tili": [
            "King Sejong Institute",
            "Seoul National University",
            "Korea University",
            "Yonsei University"
        ],
        "informatika": [
            "Massachusetts Institute of Technology (MIT)",
            "Stanford University",
            "Carnegie Mellon University",
            "University of California Berkeley",
            "Google",
            "Microsoft",
            "IEEE Computer Society"
        ],
        "iqtisodiyot": [
            "Massachusetts Institute of Technology (MIT)",
            "Harvard University",
            "Stanford University",
            "University of Chicago",
            "London School of Economics",
            "World Bank",
            "International Monetary Fund (IMF)"
        ],
        "falsafa": [
            "Harvard University",
            "Stanford University",
            "University of Oxford",
            "University of Cambridge",
            "Princeton University",
            "American Philosophical Association"
        ],
        "psixologiya": [
            "American Psychological Association (APA)",
            "Harvard University",
            "Stanford University",
            "University of Cambridge",
            "National Institutes of Health (NIH)",
            "World Health Organization (WHO)"
        ],
        "sanat_tarixi": [
            "Metropolitan Museum of Art",
            "Louvre Museum",
            "British Museum",
            "Harvard University",
            "University of Cambridge",
            "J. Paul Getty Trust"
        ],
        "musiqa": [
            "Juilliard School",
            "Berklee College of Music",
            "Royal Academy of Music",
            "Curtis Institute of Music",
            "University of Music and Performing Arts"
        ],
        "jismoniy_tarbiya": [
            "World Health Organization (WHO)",
            "American College of Sports Medicine (ACSM)",
            "International Olympic Committee (IOC)",
            "Centers for Disease Control and Prevention (CDC)"
        ],
        "astronomiya": [
            "NASA",
            "European Space Agency (ESA)",
            "International Astronomical Union (IAU)",
            "Harvard University",
            "California Institute of Technology (Caltech)"
        ],
        "geologiya": [
            "United States Geological Survey (USGS)",
            "Geological Society of America",
            "International Union of Geological Sciences",
            "Stanford University",
            "California Institute of Technology (Caltech)"
        ]
    }
    
    # Academic journals and databases
    ACADEMIC_JOURNALS = {
        "matematika": [
            "Journal of the American Mathematical Society",
            "Annals of Mathematics",
            "Mathematics of Computation",
            "SIAM Journal",
            "ArXiv.org"
        ],
        "fizika": [
            "Physical Review Letters",
            "Physical Review",
            "Nature Physics",
            "Science",
            "ArXiv.org"
        ],
        "kimyo": [
            "Journal of the American Chemical Society",
            "Nature Chemistry",
            "Angewandte Chemie",
            "Chemical Reviews",
            "Science"
        ],
        "biologiya": [
            "Nature",
            "Science",
            "Cell",
            "PNAS",
            "Journal of Biological Chemistry"
        ]
    }
    
    # Educational topics for each subject
    EDUCATIONAL_TOPICS = {
        "matematika": [
            "algebra",
            "geometry",
            "calculus",
            "statistics",
            "probability",
            "number theory",
            "linear algebra",
            "differential equations",
            "trigonometry",
            "arithmetic"
        ],
        "fizika": [
            "mechanics",
            "thermodynamics",
            "electromagnetism",
            "optics",
            "quantum mechanics",
            "relativity",
            "waves",
            "fluid dynamics",
            "nuclear physics",
            "astrophysics"
        ],
        "kimyo": [
            "organic chemistry",
            "inorganic chemistry",
            "physical chemistry",
            "analytical chemistry",
            "biochemistry",
            "stoichiometry",
            "chemical bonding",
            "periodic table",
            "chemical reactions",
            "acids and bases"
        ],
        "biologiya": [
            "cell biology",
            "genetics",
            "ecology",
            "evolution",
            "anatomy",
            "physiology",
            "microbiology",
            "botany",
            "zoology",
            "molecular biology"
        ],
        "ona_tili": [
            "grammar",
            "vocabulary",
            "literature",
            "composition",
            "reading comprehension",
            "poetry",
            "folklore",
            "linguistics",
            "orthography",
            "syntax"
        ],
        "ingliz_tili": [
            "grammar",
            "vocabulary",
            "reading comprehension",
            "writing",
            "listening",
            "speaking",
            "pronunciation",
            "idioms",
            "phrasal verbs",
            "business english"
        ],
        "tarix": [
            "ancient history",
            "medieval history",
            "modern history",
            "world wars",
            "cold war",
            "uzbek history",
            "central asian history",
            "islamic history",
            "colonialism",
            "independence movements"
        ],
        "geografiya": [
            "physical geography",
            "human geography",
            "cartography",
            "climatology",
            "geomorphology",
            "biogeography",
            "economic geography",
            "political geography",
            "urban geography",
            "regional geography"
        ],
        "rus_tili": [
            "grammar",
            "vocabulary",
            "reading comprehension",
            "writing",
            "listening",
            "speaking",
            "pronunciation",
            "russian alphabet",
            "cases",
            "verbs"
        ],
        "nemis_tili": [
            "grammar",
            "vocabulary",
            "reading comprehension",
            "writing",
            "listening",
            "speaking",
            "pronunciation",
            "german alphabet",
            "cases",
            "gender"
        ],
        "fransuz_tili": [
            "grammar",
            "vocabulary",
            "reading comprehension",
            "writing",
            "listening",
            "speaking",
            "pronunciation",
            "french alphabet",
            "conjugation",
            "gender"
        ],
        "ispan_tili": [
            "grammar",
            "vocabulary",
            "reading comprehension",
            "writing",
            "listening",
            "speaking",
            "pronunciation",
            "spanish alphabet",
            "conjugation",
            "gender"
        ],
        "arab_tili": [
            "grammar",
            "vocabulary",
            "reading comprehension",
            "writing",
            "listening",
            "speaking",
            "pronunciation",
            "arabic alphabet",
            "calligraphy",
            "dialects"
        ],
        "xitoy_tili": [
            "grammar",
            "vocabulary",
            "reading comprehension",
            "writing",
            "listening",
            "speaking",
            "pronunciation",
            "chinese characters",
            "tones",
            "pinyin"
        ],
        "yapon_tili": [
            "grammar",
            "vocabulary",
            "reading comprehension",
            "writing",
            "listening",
            "speaking",
            "pronunciation",
            "hiragana",
            "katakana",
            "kanji"
        ],
        "koreys_tili": [
            "grammar",
            "vocabulary",
            "reading comprehension",
            "writing",
            "listening",
            "speaking",
            "pronunciation",
            "hangul",
            "honorifics",
            "sentence structure"
        ],
        "informatika": [
            "programming",
            "algorithms",
            "data structures",
            "web development",
            "mobile development",
            "artificial intelligence",
            "machine learning",
            "cybersecurity",
            "databases",
            "computer networks"
        ],
        "iqtisodiyot": [
            "microeconomics",
            "macroeconomics",
            "international trade",
            "finance",
            "banking",
            "economic theory",
            "market analysis",
            "economic policy",
            "business economics",
            "development economics"
        ],
        "falsafa": [
            "ethics",
            "metaphysics",
            "epistemology",
            "logic",
            "political philosophy",
            "philosophy of mind",
            "philosophy of science",
            "aesthetics",
            "existentialism",
            "ancient philosophy"
        ],
        "psixologiya": [
            "cognitive psychology",
            "behavioral psychology",
            "developmental psychology",
            "social psychology",
            "clinical psychology",
            "neuroscience",
            "research methods",
            "personality psychology",
            "abnormal psychology",
            "psychological assessment"
        ],
        "sanat_tarixi": [
            "renaissance art",
            "baroque art",
            "modern art",
            "contemporary art",
            "art movements",
            "art techniques",
            "art criticism",
            "museum studies",
            "art conservation",
            "art theory"
        ],
        "musiqa": [
            "music theory",
            "music history",
            "composition",
            "performance",
            "music technology",
            "music education",
            "ethnomusicology",
            "music analysis",
            "instrumentation",
            "music therapy"
        ],
        "jismoniy_tarbiya": [
            "anatomy",
            "physiology",
            "exercise science",
            "sports nutrition",
            "kinesiology",
            "biomechanics",
            "sports psychology",
            "fitness training",
            "health education",
            "physical activity"
        ],
        "astronomiya": [
            "solar system",
            "stars",
            "galaxies",
            "cosmology",
            "astrophysics",
            "planetary science",
            "observational astronomy",
            "space exploration",
            "astrobiology",
            "astronomical instruments"
        ],
        "geologiya": [
            "mineralogy",
            "petrology",
            "sedimentology",
            "structural geology",
            "geophysics",
            "geochemistry",
            "paleontology",
            "hydrogeology",
            "environmental geology",
            "economic geology"
        ]
    }
    
    @classmethod
    def get_reliable_domains(cls, subject: str) -> List[str]:
        """Get reliable domains for a subject"""
        return cls.RELIABLE_DOMAINS.get(subject, [])
    
    @classmethod
    def get_reliable_youtube_channels(cls, subject: str) -> List[str]:
        """Get reliable YouTube channels for a subject"""
        return cls.RELIABLE_YOUTUBE_CHANNELS.get(subject, [])
    
    @classmethod
    def get_reliable_institutions(cls, subject: str) -> List[str]:
        """Get reliable institutions for a subject"""
        return cls.RELIABLE_INSTITUTIONS.get(subject, [])
    
    @classmethod
    def get_educational_topics(cls, subject: str) -> List[str]:
        """Get educational topics for a subject"""
        return cls.EDUCATIONAL_TOPICS.get(subject, [])
    
    @classmethod
    def get_all_subjects(cls) -> List[str]:
        """Get list of all available subjects"""
        return list(cls.RELIABLE_DOMAINS.keys())
    
    @classmethod
    def is_reliable_domain(cls, url: str, subject: str) -> bool:
        """Check if a URL is from a reliable domain for the subject"""
        reliable_domains = cls.get_reliable_domains(subject)
        
        for domain in reliable_domains:
            if domain in url:
                return True
        
        # Also allow .edu domains
        if ".edu" in url:
            return True
        
        # Allow .gov domains for certain subjects
        if subject in ["fizika", "geografiya", "tarix"] and ".gov" in url:
            return True
        
        return False
    
    @classmethod
    def get_source_citation_format(cls, source_type: str, 
                                  source_name: str, 
                                  url: str = None,
                                  accessed_date: str = None) -> str:
        """Generate proper citation format for a source"""
        if not accessed_date:
            from datetime import datetime
            accessed_date = datetime.now().strftime("%Y-%m-%d")
        
        if source_type == "website":
            return f"{source_name}. Retrieved from {url} on {accessed_date}"
        elif source_type == "youtube":
            return f"{source_name} [YouTube Channel]. Accessed on {accessed_date}"
        elif source_type == "institution":
            return f"{source_name}. Educational material. Accessed on {accessed_date}"
        elif source_type == "journal":
            return f"{source_name}. Academic Journal. Accessed on {accessed_date}"
        else:
            return f"{source_name}. Accessed on {accessed_date}"


# Singleton instance
reliable_sources_config = ReliableSourcesConfig()
