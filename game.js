// ==========================================================================
// CYBERBAR BARTENDER SIM v7.1 - game.js
// ==========================================================================

(function() { // IIFE to encapsulate game logic
    'use strict'; // Enforce stricter parsing

    // ==================================
    // BLOCK 1: CONFIG, ASSETS, STATE, DOM
    // ==================================

    // --- CONFIGURATION CONSTANTS ---
    const STARTING_MONEY = 50;
    const BASE_ORDER_TIME_LIMIT = 30;
    const MAX_REVIEWS_DISPLAYED = 5;
    const BAR_OPEN_HOUR = 8;
    const BAR_CLOSE_HOUR = 22;
    const MINUTE_INCREMENT = 1; // 1 game minute per real second
    const VIP_CHANCE = 0.10;
    const VIP_MONEY_MULTIPLIER = 2.0;
    const VIP_TIMEOUT_PENALTY = 25;
    const BASE_CUSTOMER_SPAWN_RATE = 0.55;
    const MAX_INGREDIENTS_IN_MIXER = 8;
    const GAME_TICK_INTERVAL = 1000; // 1 second
    const CUSTOMER_CLEAR_DELAY = 1500;
    const SPAWN_CHECK_DELAY = 1500;
    const POST_EVENT_SPAWN_DELAY = 2000;
    const END_DAY_TRANSITION_DELAY = 2000;
    const SHAKE_ANIMATION_BASE_TIME = 550;
    const MIN_SHAKE_TIME = 200;

    // New Configs for v7.1
    const INTRO_SPLASH_DURATION = 3000; // ms for intro (before flash)
    const FLASH_OVERLAY_DURATION_IN = 100; // ms for flash to appear
    const FLASH_OVERLAY_DURATION_VISIBLE = 150; // ms for flash to stay visible
    const FLASH_OVERLAY_DURATION_OUT = 300; // ms for flash to disappear
    const MUSIC_FADE_INTERVAL = 50; // ms per step for music fading
    const MUSIC_FADE_STEP = 0.1;    // volume change per step for music fading

    const WORKER_DAILY_COST_MIN = 10;
    const WORKER_DAILY_COST_MAX = 15;
    const WORKER_MONEY_MULTIPLIER = 2.0;
    const MAX_CUSTOMERS_IN_QUEUE = 3;

    // --- ASSETS & STATIC DATA ---
    const HAPPY_EMOTION_URL = 'https://media-hosting.imagekit.io/4498ab57bfb74d5f/image-removebg-preview%20(7).png?Expires=1841099985&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=bTqaNDxxLRwOwqMuH8KP5e0Gx8UhQEyLQ-M-OutT96l4DAU23UPSFuWddafKhcKHpFeDG-aZMASnSxnNagtMZF2Ue-XzR8NtvOxTVyxgevFqIlgLXLlP4iRQXc8REblUN4OaTuysN4pdjgGV8YdcgmIak32QvukOWj90bPytacqdDgUpFD~dPCP6FtUuv8rzMORh~BVgKku5ctRBmNQf1ju~yzzNGdcJYp6cOg1bayO090bzRFdWRr-rhN9nI-ynxnILXVZv7bijC47LlyLar2WvF-Vug9jwnhgwRh7AiyXX8RlytEMNgB8rY57J6x0CKOpsvIYfWqJ-CocsjyFRIw__';
    const ANGRY_EMOTION_URL = 'https://media-hosting.imagekit.io/4a748e86543b41ad/image-removebg-preview%20(6).png?Expires=1841099985&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=TLFHQkck~GiOJmrYznAJkbBvsxBHPN63q8PmGcDSiXWnax~EpJpp5M7CN~fnm7xXHVeG9kpDtOU7epcCQuEnMqpXZGeBY3Vv8ok8YVIjBUh~AxsKwQDrpAaVu8kYofCG3ffgIJJEaFglbb1MJ2w8TECVf55PGBiTE4mQ2as-jocjrIkkdIWWVUmQ6RCSrWd8w6WkcwD4xaokPC4UGoZK5YWHPplZwWYnPnP2XlJ6R9rkWAbw5n~IJVzaTb7d2CwzxWsWaANVb198kjP4Ux0284bED5PZdIRGQfpcQ2O4l-wDFrd9d1AnGbIGD6V1rs-E6ZcLzrzYZlVfj8dducMUng__';

    const customerIconUrls = [ /* Your full list of 7 unique URLs */
        'https://media-hosting.imagekit.io/c814d196d4864800/download%20(25).png?Expires=1841099600&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=twWkb2ozrAIHraIYN5CrRMNFcPWc3qh3EKKYlp-NjBStXYEtGFrAQkRGBT6bUmWz8Ds2dkp119Az2Xionw49BfA39azZVnqUzUH3w3Og4CQAjvG6n-L~0-FcPIs8Y4EQ96BYd0w5WSqX44-rh3noRzLRtZ~Xl~c5a2vhBsOEMUC31pr-rXaDjPlL-fOj97h9G5zRJakL2HjyVPeuwX55COm5v6-umvJJNr~oiIfWPoodrSeQ6uZnRIzCqQjQfFbRLCxvDS36iPz4Ps1uAo9aYpraCc6B0e6fQyALMUqs~GkJKmzfnpWMFsFRNJhdo~x09AYyiaiAI8WYVn~2RN-nwQ__',
        'https://media-hosting.imagekit.io/7b401d876987460b/download%20(28).png?Expires=1841099600&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=u630OnSWYNbXLIPOoVdKdIoGqHcKVLPM3gCEOxKXAOwiPiOTO~zyucSpxzwme37fAgOHT75-akutTThHm713~uEHmrI9cPLixjmaLWSth0xKHKfJ~J1lkXD-gLAcALnKgUerg0dUWiGl~zym0ni6lNMiufjDlk-HEwE6SLcYbsRQbAv0vO-P02L4twh5mokszZvns604lyMVtn0YTG34ZIvqpIXYqvelahCt72B3cuqx~~ha70xlDrmze6437elgHCslQcwisN~JhNNIhMgpTFoI7VxKL9mUpvnbpgibDGp4krSSDMdFej9rDCeUjVRPgSYbRpIgSSdlMU9aPXamfw__',
        'https://media-hosting.imagekit.io/22a458e7ec1043e4/download%20(27).png?Expires=1841099600&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=oLm2MIKhmoiF63VtSBsV9alVq6NxsiUUODIjXp2q0R8HezWQvPoFnzSLoOGS08~9zzaRDRMZl~bvzyEeljIjuhyB7BMIi-KajwXjW0EKoEPcz-f4PiBcCAHt~4eD~ONTLZXI8m~xiDIb2~cUnM-JHocjy~TLYKoVP496IdkXhXFx9Up2cQb3v~~M~67AoE-hcr~U0aIjvJD7skNvyOLH31GeUs87~O7-Nqg4N0RJusLHhPOKiVMHuLOrU-TCsEN-OswlXY~48woeYmgllhjSH3PNq1k6y7~Rp6X7jKkBbtH905djFzy4ajR0aFIr7KZfhBSZQQGmYgUOSyG6nSgBRQ__',
        'https://media-hosting.imagekit.io/ffcc13a60c7e4e93/download%20(26).png?Expires=1841099600&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=eR74zdzU2R5zOj8Xd0zjEMXyjHYID97Y6EQKqaxQrzPUlZKmOflUZs1-0FdtneA8hmiyufwAytAc9MiJU1t0jrm8JmZMHN4kKicIEO-IZVgoPuAkMYDX0GwnlvtVs-RfVPRS4GYYbPzDcUMb6VxHUWZPqMYQ6UzzQ5cUKg5ZxgY2SqZQmp98RZzTxyhWxMfUlBkzXKAPnxcoaX5D~UlgC-W-PTSup1dOs8KZwvB2qSWxlBwyF-SycfqPrDUs8LLiwr5zg59P-1Cj7gqAhpB9WfNyosna6eTbcr0h2Dp6a6IV3o3YzfPuecBWx6TeNsDqV8zL6CY~i8XL3GMZ-W5UqQ__',
        'https://media-hosting.imagekit.io/1e0c9ff67c6942c2/download%20(24).png?Expires=1841099600&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=cJLrUQ9ah9HTXtSNzHo45jZT57-lefaRK5KVez~Eah6ORaHpmOxQDNa2vlocNlysHnm8MFbJZn12hZZlopwWrL4MbrPOCTo5Khoqw386FqH2a~323mkRxckWDekJUO~B1toKJF5naQ3PF9d-D86DViL0CUC6pDSBU2JVSfj0aA19XRJc4qzi8LVu2x8wuDl3rMxmxYWA8l0wVUKSGMXv-xz9bBT6S0uFjXIzm5PJOubo0wkUy5aUPql1Vq2PoRGStZpbvcqusu96B1RnagNKWXW2Z8hqZzXXGYTM~t5UVi7cJwhHEhbqK30LJe6X2sH5~r6QxG~lkeaFxJ7RvB26TA__',
        'https://media-hosting.imagekit.io/1926f7bfbfd044a6/download%20(22).png?Expires=1841099600&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=uXhTad~JYnyboBKNwNtNC2jmrLcIssOdDDzEg4~eP1K68AgljRyGz5a9cTW4azqg8nS4mjomPjzvbTOJqAbm1ahg8yE2CyvMaFS7Z4ftE4Fx1PFuNmRtDjvl8mB~-dezFMVVJ-lwkFVS1NzD5gRqY40T9wjtuytY1rN7iwoHQbgydZ7TMJFWRDZxKvXtADwteSuqddOfs4Sz43Cq2Pjp0bssRoBd0FhnMCjnQRjGmFh6Z~cLBWEwB4XJXhjp1KUaRubCWP8wNZ59w4OhWeSpwksfRxy4bD9s8fd0riHCQKgB6ysrCXQKmwfgwSJaA3B32FEu-xtQ6bectTSfMC8eGQ__',
        'https://media-hosting.imagekit.io/98ee41e1fbcd4ca6/download%20(21).png?Expires=1841099600&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=t-caRYyGvSE1fUg~abiW2FydXmITapvxCV05g0aWIYQ7MEN1Vnto5a32wD62otEPzaiVFs1Qx5tg5yooMswpZKjDOKOzJxlOfvfsIebUTTz3c51ALOHiwgSHq8FPaH9G4fjhOqQCjAlk02ValqWYpV61KtJ3VkGewjeMWn3j-KjGK2u2moOBQNHj9xFy2sMdbKAAEimgOjDjPw7t0b5ZsEfj1LgY6yD7A8PUpjytQkctpcUp6~9JpHDF~1WS3Fu91dEIuyIU~egy-t~UE~UOhX~yv3yxKkmnSVneYt-YLNkeWx3WPfenebPQyhykPZ1YobIv~Ghqi2AOL4Kgke2FpA__',
    ];
    const customerNames = [ /* Your full list of 100 names */
        "Jett K.", "Nyx S.", "Raze L.", "Echo V.", "Silas R.", "Lyra M.", "Orion C.", "Cyra B.", "Jax T.", "Nova H.",
        "Kaelen P.", "Vesper G.", "Ronin F.", "Astrid J.", "Zane D.", "Seraph Q.", "Lucian W.", "Mira X.", "Corvus N.", "Elara K.",
        "Blaze A.", "Strix Z.", "Raina Y.", "Drift I.", "Helix O.", "Quinn E.", "Wraith U.", "Lycoris C.", "Axel V.", "Terra M.",
        "Cipher S.", "Vortex B.", "Maverick T.", "Indigo H.", "Javelin P.", "Zephyr G.", "Rook F.", "Nebula J.", "Shard D.", "Oracle Q.",
        "Gage W.", "Lyra X.", "Torque N.", "Cascade K.", "Reverb A.", "Flux Z.", "Pylon Y.", "Synapse I.", "Ion O.", "Trace E.",
        "Apex U.", "Grid C.", "Vector V.", "Datum M.", "Pulse S.", "Kyber B.", "Core T.", "Relay H.", "Static P.", "Circuit G.",
        "Byte F.", "Link J.", "Node D.", "Kernel Q.", "Matrix W.", "Pixel X.", "Render N.", "Vertex K.", "Shader A.", "Frame Z.",
        "Lag Y.", "Ping I.", "Proxy O.", "Firewall E.", "Root U.", "Admin C.", "User V.", "Client M.", "Server S.", "Host B.",
        "Terminal T.", "Console H.", "Script P.", "Code G.", "Logic F.", "Syntax J.", "Debug D.", "Error Q.", "Crash W.", "Reboot X.",
        "Override N.", "Patch K.", "Mod A.", "Hack Z.", "Glitch Y.", "Alias I.", "Handle O.", "Avatar E.", "Persona U.", "Digit C."
    ];
    const playlist = [
        { title: "Sweetheart", artist: "Lentra", src: "https://github.com/PotatoDeveloper01/bargame/raw/refs/heads/main/lentra%20-%20sweetheart.mp3", forMenu: true, forGame: false },
        { title: "Pixel Arcade Chill", artist: "P I X E L", src: "https://github.com/PotatoDeveloper01/bargame/raw/refs/heads/main/P%20I%20X%20E%20L%20%20Arcade%20Games%20style%20Soundtrack%20%20Lofi%20and%20Chill%20to%20relax%20study%20to.mp3", forMenu: false, forGame: true }
    ];
    // For Patron Interactions
    const patronDialogues = {
        greet: ["Hey there, bartender!", "How's it hanging, code-slinger?", "Greetings.", "Yo.", "Spill the good stuff.", "Another cycle, another credit."],
        askThoughts: [
            "This place has potential.", "The neon is a bit much for my optical sensors.",
            "Not bad. Not bad at all.", "Could use some more upbeat synthwave.",
            "Best synth-ale this side of Neo-Kyoto!", "Heard a rumor about a legendary drink only master bartenders can make...",
            "The ambiance is... digitally adequate.", "A bit quiet tonight, eh?", "Love what you've done with the place... or not."
        ],
        jobOfferAccept: ["A job? Here? Huh, why not. Beats staring at the data streams all cycle. I'm in!", "You drive a hard bargain, but okay, I'll sling some synthahol with ya.", "Work for you? If the pay's right and the tunes are good, count me in!"],
        jobOfferDecline: ["Nah, I'm good. Freelancing pays better.", "A steady job? Not my circuit, pal.", "Thanks, but I prefer being on *this* side of the bar."]
    };


    // --- DATA STRUCTURE INITIALIZATION (populated in Block 2) ---
    let allIngredients = [];
    let allDrinks = []; // To be populated with your full drinks list in Block 2
    let barUpgrades = {};
    let bartenderSkills = {};
    let reviewPool = {};

    // --- GAME STATE VARIABLES ---
    let score = 0; let money = STARTING_MONEY; let currentDay = 1; let gameHour = BAR_OPEN_HOUR; let gameMinute = 0;
    let currentCustomer = null; let orderTimerInterval = null; let gameClockInterval = null; let customerSpawnTimeout = null;
    let remainingOrderTime = 0; let currentOrderTimeLimit = 0;
    let selectedIngredients = []; let isShaken = false; let displayedReviews = []; let currentlyDragging = null;
    let customerQueue = [];
    let clearCustomerDisplayTimeoutId = null; // <<< NEW: To store the timeout ID for clearing customer display

    // UI Visibility & Game Flow States
    let isIntroSplashVisible = true; // Game starts with intro (HTML also has .visible)
    let isMainMenuVisible = false;
    let isGameUIVisible = false;
    let isTutorialVisible = false;
    let isSocialUIVisible = false;
    let isJukeboxUIVisible = false;
    let isQueueVisible = false;

    // Game Logic States
    let isBarOpen = false; 
    let isSetupPhase = false; // Becomes true after tutorial, before Day 1 gameplay
    let gameActive = false;  
    let hiredWorker = false;
    let dailyWorkerCost = 0; 

    // Jukebox & Music State
    let currentPlaylist = []; 
    let currentSongIndex = 0;
    let isMusicPlaying = false;   
    let activeMusicPlayer = null; 
    let musicFadeInterval = null; // For fading music


    // --- DOM ELEMENT REFERENCES ---
    const introSplashScreen = document.getElementById('intro-splash-screen');
    const introLogo = document.getElementById('intro-logo');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const playGameBtn = document.getElementById('play-game-btn');
    const flashOverlay = document.getElementById('flash-overlay'); // For purple flash

    const gameUIWrapper = document.getElementById('game-ui-wrapper');
    const gameWrapper = document.getElementById('game-wrapper'); // Already exists
    const gameTimeDisplay = document.getElementById('game-time');
    const gameDayDisplay = document.getElementById('game-day');
    const openCloseSign = document.getElementById('open-close-sign');
    const ingredientsContainer = document.getElementById('ingredients');
    const mixingStation = document.getElementById('mixing-station');
    const mixerImageVisual = document.getElementById('mixer-image-visual');
    const mixedIngredientsDisplay = document.getElementById('mixed-ingredients-display');
    const customerIcon = document.getElementById('customer-icon');
    const emotionPopup = document.getElementById('emotion-popup');
    const chatBubble = document.getElementById('chat-bubble');
    const messageBox = document.getElementById('message-box');
    const scoreDiv = document.getElementById('score');
    const moneyDiv = document.getElementById('money');
    const timerDisplay = document.getElementById('timer-display');
    const skillLevelDisplay = document.getElementById('skill-level-display');
    const upgradeLevelDisplay = document.getElementById('upgrade-level-display');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const recipePamphletDiv = document.getElementById('recipes-content');
    const unlocksListDiv = document.getElementById('unlocks-content');
    const upgradesListDiv = document.getElementById('upgrades-content');
    const skillsListDiv = document.getElementById('skills-content');
    const reviewsListDiv = document.getElementById('reviews-content');
    const clearBtn = document.getElementById('clear-btn');
    const serveBtn = document.getElementById('serve-btn');
    const shakeBtn = document.getElementById('shake-btn');

    const tutorialModal = document.getElementById('tutorial-modal');
    const startGameBtn = document.getElementById('start-game-btn');

    const queueToggleBtn = document.getElementById('queue-toggle-btn');
    const queueSection = document.getElementById('queue-section');
    const queueList = document.getElementById('queue-list');

    const openSocialUIBtn = document.getElementById('open-social-ui-btn');
    const socialUIScreen = document.getElementById('social-ui-screen');
    const closeSocialUIBtn = document.getElementById('close-social-ui-btn');
    const patronInteractionArea = document.getElementById('patron-interaction-area');

    const openJukeboxBtn = document.getElementById('open-jukebox-btn');
    const jukeboxUIScreen = document.getElementById('jukebox-ui-screen');
    const closeJukeboxUIBtn = document.getElementById('close-jukebox-ui-btn');
    const jukeboxControls = document.getElementById('jukebox-controls');
    const jukeboxSongInfo = document.getElementById('jukebox-song-info');
    const jukeboxPrevSongBtn = document.getElementById('jukebox-prev-song-btn');
    const jukeboxPlayBtn = document.getElementById('jukebox-play-btn');
    const jukeboxPauseBtn = document.getElementById('jukebox-pause-btn');
    const jukeboxNextSongBtn = document.getElementById('jukebox-next-song-btn');

    const menuMusicPlayer = document.getElementById('menu-music-player');
    const gameMusicPlayer = document.getElementById('game-music-player');

    // --- End of Block 1 ---
    // ==================================
    // BLOCK 2: DATA DEFINITIONS
    // ==================================

    // --- Ingredients ---
    // Defines all possible ingredients in the game
    allIngredients = [
        { id: 'ice', name: 'Ice', cost: 0, unlocked: true, color: 'var(--color-ice)' },
        { id: 'synth_gin', name: 'Synth Gin', cost: 50, unlocked: true, color: 'var(--color-synth_gin)' },
        { id: 'pixel_vodka', name: 'Pixel Vodka', cost: 50, unlocked: true, color: 'var(--color-pixel_vodka)' },
        { id: 'laser_lime', name: 'Laser Lime', cost: 30, unlocked: true, color: 'var(--color-laser_lime)' },
        { id: 'cosmic_cranberry', name: 'Cosmic Cranberry', cost: 40, unlocked: true, color: 'var(--color-cosmic_cranberry)' },
        { id: 'glitter_tonic', name: 'Glitter Tonic', cost: 25, unlocked: true, color: 'var(--color-glitter_tonic)' },
        { id: 'plasma_orange', name: 'Plasma Orange', cost: 40, unlocked: true, color: 'var(--color-plasma_orange)' },
        { id: 'nebula_nectar', name: 'Nebula Nectar', cost: 60, unlocked: true, color: 'var(--color-nebula_nectar)' },
        { id: 'turbo_rum', name: 'Turbo Rum', cost: 55, unlocked: true, color: 'var(--color-turbo_rum)' },
        { id: 'quantum_cola', name: 'Quantum Cola', cost: 35, unlocked: true, color: 'var(--color-quantum_cola)' },
        { id: 'holo_mint', name: 'Holo-Mint', cost: 45, unlocked: false, color: 'var(--color-holo_mint)' },
        { id: 'star_syrup', name: 'Star Syrup', cost: 70, unlocked: false, color: 'var(--color-star_syrup)' },
        { id: 'cryo_cherry', name: 'Cryo-Cherry', cost: 65, unlocked: false, color: 'var(--color-cryo_cherry)' },
        { id: 'bit_lemon', name: 'Bit-Lemon', cost: 30, unlocked: false, color: 'var(--color-bit_lemon)' },
        { id: 'void_essence', name: 'Void Essence', cost: 150, unlocked: false, color: 'var(--color-void_essence)' },
        { id: 'flux_foam', name: 'Flux Foam', cost: 120, unlocked: false, color: 'var(--color-flux_foam)' },
        { id: 'chrono_cordial', name: 'Chrono Cordial', cost: 200, unlocked: false, color: 'var(--color-chrono_cordial)' },
        { id: 'plasma_berry', name: 'Plasma Berry', cost: 90, unlocked: false, color: 'var(--color-plasma_berry)' },
        { id: 'static_sugar', name: 'Static Sugar', cost: 110, unlocked: false, color: 'var(--color-static_sugar)' },
        { id: 'gravity_gin', name: 'Gravity Gin', cost: 250, unlocked: false, color: 'var(--color-gravity_gin)' },
    ];

    // --- Drinks ---
    // Defines all possible drinks, their recipes, and properties.
    // <<< USER REQUEST: Paste your full 'allDrinks' array definition here. >>>
    // This includes all ~54 drinks with their names, recipes, requiresShake, needsAging,
    // price, unlocked status, cost (if applicable), iconUrl, and requires array (if applicable).
    // Example structure:
    // { name: 'Synthwave Soda', recipe: [{id: 'pixel_vodka', count: 1}, ...], requiresShake: false, needsAging: false, price: 6, unlocked: true, iconUrl: 'your_url_here' },
    // { name: 'The Void Walker', recipe: [...], requiresShake: true, needsAging: true, price: 25, unlocked: false, cost: 300, requires: ['void_essence', 'chrono_cordial'], iconUrl: null },
allDrinks = [
        // --- Starter Unlocked (10) ---
        { name: 'Synthwave Soda', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'glitter_tonic', count: 1}, {id: 'laser_lime', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 6, unlocked: true, iconUrl: 'https://media-hosting.imagekit.io/fa9c3e70c9e74cc1/download%20(2).png?Expires=1841094862&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=ugLlDscC5AApPI6t2ghvqQs-S5prpEf4tTTjA1hFh0cRukkf3LqwUBzzg3FyxLAPV8d2uDkz9QrmDXCIvL9q6dcgkS45sha5nfbBZ3-7CWQmRB1Ha7LJk2VFl2cNM-mLCtlEibWJrMQUfhINdytipG1mp2Jq8BqTVALQp981x99-BAId5UPEfgeKGftIGQV01D3OjLuWUqDdFZUeOIBaNhrJUUImKrEreFeP2cUPTrrVjieJ~bwaTd6nAJZZsnDd43jtSNU4z0aB~bDMTjuKZ6jGR3TvJK8mw5DypCvYW9dFkQNnr9ezBWfugL2zx28UyUn4jso1E-w4igDAuWpjBg__' }, // #1
        { name: 'Laser Lime Fizz', recipe: [{id: 'synth_gin', count: 1}, {id: 'laser_lime', count: 1}, {id: 'glitter_tonic', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 6, unlocked: true, iconUrl: 'https://media-hosting.imagekit.io/d13a87dafd994c47/download%20(3).png?Expires=1841094862&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=pWKE691S-8KcISvHleDw~2S4sOP9LeF4YvTYWzcMECH7D3BWfdHTE4UyW~P8IB7gFOteJu31kCVm0U6H5MirM7B8P2LlfqE73oxTV25k3IVNkgNRvh5dznpT2ZFepO8fSCpwHj6txkAr4fv6GR2wpxf9zupCp~-RsHMRJg6yWPhmr1SAQy7pr0djgHI~~mGkSza4dO4F2e5T-R9Gj7ZYAjcNHxHOiW7T9VmxXPhqngeSU18Hq5nHVfGEo8in6acs6sN7Wy5gEQ2~IRMpnKMrQwbC81VlzcKxZpj07gQ1d1JnfO2WjTWf6T1JZmG9kdBy1qlycjN0Ajf7-IxPWtwKEA__' }, // #2
        { name: 'Gin Nebula', recipe: [{id: 'synth_gin', count: 1}, {id: 'nebula_nectar', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 5, unlocked: true, iconUrl: 'https://media-hosting.imagekit.io/3c5d79f4464248b7/download%20(4).png?Expires=1841094862&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=R4Rh1fWIj~z2gn-AHOwwop6ATyiDyOWYMTwzCMOX7NSGdIby5-aJ21pUmCM6sMjIGoNQSWE1PNEkB~peznBXlOyRA7nNKFEKBsWihQpYCFAcR7pV6bYVtoxZj9FJOJF0X~eIQYznQDPz3FB44TI5Fnb1cI7C8ZtF7RQ6F2D-O53qkz9lA4cFBbZkkLS3TTJPYr6agKdkFkey8neyCNyZztzn1GhtVm97rZNwKErsSJwBXf4cNH5d-J~AYDbaP6eCLGhhMJIsT-t6uSe9KNHLlBBULli9njyEAzLNDUJiKs-NTBnnwb~~tQz17Asvojyss~d7a97-Z5F6Ff2~nBeFqQ__' }, // #3
        { name: 'Quantum Runner', recipe: [{id: 'turbo_rum', count: 1}, {id: 'quantum_cola', count: 1}, {id: 'laser_lime', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 7, unlocked: true, iconUrl: 'https://media-hosting.imagekit.io/f7f778b27b6c4755/download%20(5).png?Expires=1841094862&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=fAqUO6hteWotxIfYI~NJ~Ij3IBdbRNnYJe50ZlD2MLc5nBo5bSMK103w8rSUrw378IOt8oDaJxA6wGWFfgA7LxXRYK9lHMU4dm0MSxq2F~yYzdIyzrKKjBd32Si59s0Eq6lQF8DaGjpCt6GW5tB1m9GGTBw1qFZSYeoA6bokU4Kry-7zPxiXkb1m2vIYMhCwAWW3FywH4uTX17BwqsgojGd5ZibR73fRvkHbgyOrRNH1eq5XsLqspC~QnxsX3OlwIFpkQ1g3S6ZloGZ8-L9sckkvUaxett-XYTTyycwE9sjboAQRHC~Q4XamSkb0NJSdkeZxWQADJSTNkUvx0LPC~Q__' }, // #4
        { name: 'Simple Tonic Splash', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'glitter_tonic', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 4, unlocked: true, iconUrl: 'https://media-hosting.imagekit.io/4822e62d857a456f/download%20(6).png?Expires=1841094862&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=PvkN45JLow5Fj-0TrlH9fyLekIC6E5b01PAAMwN52f~Vu1zsbCWwHKRv8zl~8gZ8SpKBjqoOmkFNCoTJ1o5oBnxegqkGOoaxIn~NiZXuQZ2Y4ZPnlEfzA3vLfaJ6YHkhfyfn-Cs0eyQB4hV3XxfPmvlfvPaALAUshRH5DN73Z06VJyj6vX64TaErOqLEaX158ugUUQDlosEvY1XtWNSIeT7weTE2kGGFXGLyWA94Var7QvXTQa5rKMnGoa3OoYQh2ifF3qUWxAJF5UzZQSbitK2cDL4F-GWqzhX~y6pkyYjg4ku1yEOD9z4A16gkCnme8vwWpMeB40OFF1ZJEml-WQ__' }, // #5
        { name: 'Neon Cosmo', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'cosmic_cranberry', count: 1}, {id: 'laser_lime', count: 1}, {id: 'ice', count: 1}], requiresShake: true, needsAging: false, price: 8, unlocked: true, iconUrl: 'https://media-hosting.imagekit.io/ae6ea30f8af64221/download%20(7).png?Expires=1841094862&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=emlQJ1HfGsel0EnvZrsa5s9KLo5jjKhv2AUFUYweX8NRm0PWy10RTosdwWe~MP7nXjyQGFsu1xP7jkOvoCOmPogiTWC2j7MAlSbyiQ3wRc~SZeXtSWg8APfK6YtUQ295L6eLdKVeUAEvC0piBylb6IqxNWxkce1WyXUrEE6PYggAKn4Me2GOHnhEUWG-yGQVux1DnpHCdWldxAaq6oNXZ58BelZSxDhJTJ9UT3I~rKKTZRDt5gOCdTly~5IzoiJ4B1cQY71BOhl7jaGDM5c6kvFcUsaqNdO~41QtSjgwCut4TguDUru0PaYN~awCvKXBtVmUVhBH~ULtdXO3mujAxQ__' }, // #6
        { name: 'Pixel Punch', recipe: [{id: 'synth_gin', count: 1}, {id: 'plasma_orange', count: 1}, {id: 'nebula_nectar', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 7, unlocked: true, iconUrl: 'https://media-hosting.imagekit.io/e54150656c184dd0/download%20(8).png?Expires=1841094862&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=c25bWUFx7UEXaxaZDignaqLvmJUiNKOZfFz4tQlbMYy1AFkE-5lTyEbwOAfzL6hEePUxmOb6lYW-R0Gkg151ORruHxc9ol7hg5wPlONEIr-ifugOKzruGBmFgeyrrp1OWlQItfvVPVgymHNM0R4rZ-eGPhxur6DTI0nu1r9rCVDmHoqdp7J0cSinHOyTPT2AGxKCdne4HWCYwSWaesEc-LEHiFyYqj1bCfM-jjYz1NihICD~FdgZPYaof2zfziFM67eg193p2U67gb8XtfKbo9wIp4oeOEOC1ZPvPEHGfvol7poS9x6MIOh9evQshQgEm7BhDPxdgMQskUMe26oNpQ__' }, // #7
        { name: 'Cosmic Cooler', recipe: [{id: 'cosmic_cranberry', count: 1}, {id: 'plasma_orange', count: 1}, {id: 'nebula_nectar', count: 1}], requiresShake: true, needsAging: false, price: 7, unlocked: true, iconUrl: 'https://media-hosting.imagekit.io/a8a2eefad30f456e/download%20(9).png?Expires=1841094862&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=SAhTFqDJz4OOOchfzczA7BX8D7rMiXxKDpDHjQdsp~guTGowsJc6v2J6p8AoUIFczZ-uLtqylxICdK42o22PZwXbeDvYJ0iKMOs5EjFtmST5YRhRTPNb1nSfi3OIE-9DdyccRdiJGkuCxiT7SuAdlVWTQWlgymWZ3s5vtQIY~ExKmkOthWonBJ0nOlhYESKlzmm4LiynGR4D6SaHKFjvr14ZR7-wOpHnmNfSZT8X5D3hswM8xXZAe4PQ1mxNL63Yl~VLKYMlRBnsFG32nxxfTvZSgNB~AMGdjKm~54KGOIKeXADjuo4EEghFPJUm0589Htx6duSbWA57fo0-IDpxHw__' }, // #8
        { name: 'Rum Cola', recipe: [{id: 'turbo_rum', count: 1}, {id: 'quantum_cola', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 6, unlocked: true, iconUrl: 'https://media-hosting.imagekit.io/7cd0a2979aea4cd4/download%20(10).png?Expires=1841094862&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=hNhHXzxKkREHESDBtrSV4~vTAAf6KEN5JWOwKNTxVkwPMZHQ1i0LN7sF4OAuzGi67vXDgfvJo3Q9D9K2VeB98ZcgNdahiPPnsCJHENXDIqIrwYtLRZ-CIY42LRiTLRGdHHoaxryKWSP9wNgza8B6SMEwhA3z-VYnnaAmKhC-s6-NWO6t35Ok-kcZ72V79YVsagymexkSANgxmlvaZ6G~jbGxC~Tqr~aMx2J0N1LVdvgrAssOeN78TULQK1j-DtalQpywMR1LtTHbgYAb8eeiLkjM3-6ahAELJMZWe7Bb-L5PtsaLkfsN3WAKTm7tBjLZGp5oWHub4GG-E4S3E9LYhA__' }, // #9
        { name: 'Gin Lime Soda', recipe: [{id: 'synth_gin', count: 1}, {id: 'laser_lime', count: 1}, {id: 'quantum_cola', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 7, unlocked: true, iconUrl: 'https://media-hosting.imagekit.io/67bdbe0bb0bb4d0e/download%20(11).png?Expires=1841094862&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=OXHm8Tj5ZR1AVYO5LNus0LprHK9w1iv8Wm6gj~6ISbtkMQ8bGNNZncp1qDJEWpBMrS3d7pQXWTxO0-NSSSrluJPuWTPUBw1EWzXq8edu8cjWJnqwd6JHXwYmf606D6pIzg0ZXs5d4YmWP5izhxk5LyCxTmnnLLewNR7WDN6R2-t7hHSZyTbelKHgbTB8s1FGSC8nL~JU9lkPDsN3RacDIgDWwXY8dnUPuxIj4cIol7KM6Mm4E6spAl-5c6moROSEOqzKUy8Fbieda5jjmQNTxT5T0ZK2Cm4tdqXEVVcow3I5FZq4AhUwreLmuD14wdAPKe-5Kuwe22WVCDJECeZbVg__' }, // #10

         // --- Locked Drinks ---
         // Tier 1 Locked
        { name: 'Double Gin Tonic', recipe: [{id: 'synth_gin', count: 2}, {id: 'glitter_tonic', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 8, unlocked: false, cost: 50, iconUrl: 'https://media-hosting.imagekit.io/f9f56e69e2c24e9c/download%20(12).png?Expires=1841094862&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=lKfI9PnKehoU-EGEIBqgwzBuqYrjFtLvu~3a0GVLles6xqw4lcYDyr3zemfRpo00v71Q1bR1rOXmOwx-oJe0O88uNyIAOGei2eGCow3DfVvv~SNBrrNYssz3Zi4Xo-bwJYXvO7~pFEmW1A5Kn6WD79p0onKpj-GYxMy4LChzqZsUozf1QayNMOxr0Kdt66UMiHdSly8hipM6WgTmszbNZxmmjF1wkxtf4xIHt9oSSSXAQr-iRKUCnBBu494qsRB4VSZjYcFAEO6O3sf03qT6lnms69J2agdwb3PIVrsNA2~VNl3UEFMu8twf3sDX0-uwiWfmGAmPNx1BWZ6P4zHERA__' }, // #11
        { name: 'Orange Burst', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'plasma_orange', count: 2}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 7, unlocked: false, cost: 40, iconUrl: 'https://media-hosting.imagekit.io/5a6c5f9176854050/download%20(13).png?Expires=1841094862&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=OiRbbb4VDUjz0C8RG~ipBxdgWnzH1iSBkfLoqYVkL71XtV6cqRBd~fCakzCahUO7xr~eygTLgHgZ2DTLQcEsnO9dYYTEUqXWXh2hapYy5UTbnNuS1ahewIviwq3KTe12GQQ8terciiZWDIUZHOeX1RAOZqhNBZjQ0EfgMDPNli5Q0N6Ya7MMeYakriuhteLo-3zXMvKkhln7SpxT14Y02ye9POwkmqMWG1Gv0WnxAmzoQOjdF38nWeVrvBrsvFi0sPKAtNqRr6i7yduIfPyE8HYrJhybrm3iWL418gquZ5PB4rpDZLURRVqnvlXRQHINrnBrP4l62TyweTKIYWv4SQ__' }, // #12
        { name: 'Limeade Splash', recipe: [{id: 'laser_lime', count: 2}, {id: 'glitter_tonic', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 5, unlocked: false, cost: 30, iconUrl: 'https://media-hosting.imagekit.io/ffc08a9b0600489d/download%20(14).png?Expires=1841094862&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=UpIrDuymbKEZklcmiYJhKDqopcFb83O~gb-93GdDaSWXQVzwQb1enPce53Eu6KzdfDOTe3cMYcJQ0sWksNpSErE4L-giRnlzU16Whje92EKxJ12VRZ7jlTL5vO0AKk15XW06QGh1RXaHt2fSP9wu4NtqlSyxrCqvl06kd9c3CRXvfBi1ysoVVC--BbXfD-Y4n1sz2v0MPdXkTj5ZMfcx3ac3k3LTGV1kNDXUNoNGGeXAH3t-K~~Gxnqs1~WsrhBkfYAuj4dl5OrXLBv6ikCneuiAxDbztpdrQjJy9ShvdpHM4CGaWN5BwuyGXnJ2vb6zmuFRdhvWGYQgPwNV3-0mcA__' }, // #13
        { name: 'Cranberry Zing', recipe: [{id: 'synth_gin', count: 1}, {id: 'cosmic_cranberry', count: 1}, {id: 'laser_lime', count: 1}], requiresShake: true, needsAging: false, price: 7, unlocked: false, cost: 45, iconUrl: 'https://media-hosting.imagekit.io/c4587fa0ad0942de/download%20(14).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=GR0oO4inru9gz7QPbrrM-lXcBIhB6ELOz3T0GOctmBJyisuBYvs895Z13d9YwURc~M1S1dpzyeK3a9EiswG5RI-AQbB2hk2iyccQ0cUJCVi4Am9CeQycVN2fEP3zUlFdd7dFXXUlojEN5c7aS5Vb4p5O1W2LASIcBpmHAa7Ms~k28n8bn5cbFuqHxeUBxxwoZeFam0P7JSgvjcV1DPbZNpUsrwo-b4EHSJz5PSRQwWMWfKfPpNWjdpxbk6HjUURdEkYC5WyBAUdnrvQB6b9SzNPChDfB58I302Mnv6tNG6YGnhUIUYWNfd7i1jauJRVVI9VDk4zcgvY2iLAQD5e12A__' }, // #14
        { name: 'Turbo Tonic', recipe: [{id: 'turbo_rum', count: 1}, {id: 'glitter_tonic', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 7, unlocked: false, cost: 50, iconUrl: 'https://media-hosting.imagekit.io/ec04e7fb2cd84e19/download%20(16).png?Expires=1841094862&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=VjupyxedSDcnAie3zQfMqL1ZCJ-JhU1LW1N8c3ffGp4y-cNoOnDGV-GxmLDxWhWEERzCcc8Oj6vX0nYFKhKPWVuT2dQT0sXV0Mc8KNLbJA2Fi22aja9I-dX1up2xC3pzRfWzEQxJbklpV4bOrA6YZl3lT9QU4x03Wr4HNr3w4ssez~Oj~-pdHpzAkyQRYkKrQjcZsu1xlawfY4snszwZjy4fGo5zVBdKgSjMtSSyvHdhg2am-zFyFT-Q6XQWSk9FxBDL9gr8r~mV38PCjzSlqE6mGQXZ~Cv5iFKYCLE-6N~dEHFUpsYlSbs3QYoZsuT9pSr5WRwRG78XHIrs9ZmQFA__' }, // #15
        { name: 'Minty Gin', recipe: [{id: 'synth_gin', count: 1}, {id: 'holo_mint', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 8, unlocked: false, cost: 60, requires: ['holo_mint'], iconUrl: 'https://media-hosting.imagekit.io/613e0a4db48341a0/download%20(16).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=KC5t1TU5Px0gdawwzStxtqipBKHnvgCAFodmMwMWDQpLbYUyXXWuuett6t8KkSAuj0BV5w71Jk~Js10h4zRNpTxiQxM8r-Ua4HtRDH70BqGMNs9mn~gHyWZPGJvg0Ea38LEfo1PB4z~0XVXlU-H2X2y~BxScuYTP6mbUGFPaoT7-6td~HoH4g~SYchfFeU6~hPP3~K53vdnftQkxCHkYGnMi1RJbBcOqobVO9WQw6gUmUw6o7Bn-22uEzeFA~WPvu-cOiNstFef8~32c324y4aTKfaVTB7PUsQ-JUx1keDAup2BnUmrmWoXbFIgYsx6kU-JdCMgs3O1aG8p5gnExvA__' }, // #16
        { name: 'Lemon Drop Bit', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'bit_lemon', count: 2}, {id: 'star_syrup', count: 1}], requiresShake: true, needsAging: false, price: 9, unlocked: false, cost: 70, requires: ['bit_lemon', 'star_syrup'], iconUrl: 'https://media-hosting.imagekit.io/5e5c957dab3a41c0/download%20(17).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=U3FjtvxbPUA6g9ZbmXnSejoB3r~KbZS0qhcjuenJVsFCc70kON6LkHfk7gW1oYIxxc-RwVgIZasEw-WOheLLQZh8j27qsVXscOTy87mgSmo5DVIrHYw7h2nCgw5JzQ0BWYJCNoNcGUeJuA-N2BivCtxuGUE4pJJJLmYuR~m0MNMdBYCmLaN2524m1YF1i18FlvzCGQfRv6U1BXUkFKnJSHV0gpta6H1sYytkv6LTOUWXMD~V99Qkko77k6SUNBzLmtnyy0t959ORMRFAq-rLwu9wrSMljTwcyKgu3Z96SAUvCqm0Hmetruj8~pPc8Nxaummp3HWhcdHy7SNhAi1-Lw__' }, // #17
        { name: 'Cryo Cherry Cola', recipe: [{id: 'quantum_cola', count: 1}, {id: 'cryo_cherry', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 8, unlocked: false, cost: 65, requires: ['cryo_cherry'], iconUrl: 'https://media-hosting.imagekit.io/da5f703593e6498a/download%20(18).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=oSKNV6GgRnT2Yc07pqfBITki1CE8zkEbIlLU52GItir9EocsM6uJhQpF3EdnD4E6JMTsrqRTbFvIC5gxk9QnZvmWKY8RMyIYkYnrnGkq-5IMC0N82tE-sKL-CPFv3RqwcLEuP7KsrK720fMI1HiwUiKdqB4aZCdG0tXcAABBD56stCj4azo4BFUVYm0I1XfJP0NQ1TaRuKyw3dwoRAca8kFz0vT27EYWSl41PzkB6oRBW7~Evsuk056EWq2TnRFO7ssH92e8sWh2rMOZB5UfYImE3-eVI4-Oyr8iznFUri8MCH6M8i-LaUKg~WCgpKz7vp9fsRhect1kf2x4U3qbFw__' }, // #18
        { name: 'Nectar Twist', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'nebula_nectar', count: 1}, {id: 'laser_lime', count: 1}, {id: 'ice', count: 1}], requiresShake: true, needsAging: false, price: 9, unlocked: false, cost: 75, iconUrl: 'https://media-hosting.imagekit.io/8d568f7b5e6a4c49/download%20(19).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=3LvCOzzWQrKt6J1HuCAj4t2JBZb0DZcIeobYh6XZzxgTMi~IpeuYjEBhs1CvGuHozbf7RFbSuwYJFwpGHTADCTXd6Yh4w6JNZB60WZlqDt1ZLhCs6dbMdoMhL0ldeQCMUSYG9G0mEyxZfgT8jAJscAe8eJTYN4wNz3j5cf6ALTjnm3sjjHKcspmZlVYYK9VIlFiNuidiLTchxb6v0R8u~L6afpFHPEnkK9fIVa4jsif7aJMvdOXN4HCmvtwNwsNqOR3VNiGgT637csBfz-P99Ukrhb5taU7da~p8L12T-t2zWc1p1rsH9Mo0tpdk77Xc-fsKpCV9cUImg35KFZsmsw__' }, // #19
        { name: 'Plasma Rum Punch', recipe: [{id: 'turbo_rum', count: 1}, {id: 'plasma_orange', count: 1}, {id: 'cosmic_cranberry', count: 1}, {id: 'ice', count: 1}], requiresShake: true, needsAging: false, price: 10, unlocked: false, cost: 80, iconUrl: 'https://media-hosting.imagekit.io/d33538c389184f6b/download%20(20).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=w8HA-U148gLuHEDLuE8CXzMBIVR58ANQ9nabMXIfnJncYxSuSRe8kBqpN1TpMkb4F~z4jMnnHrDCgfHrDLstt4bcO323OYUBO42lixOO7udrgH5mEJuqmyW6gqUaCvij0ENfKOruYvOsm-JMlceRtOW2YTgedZrF862mBPbWuMbOthobwjUkaG0DgmYjNSTluKKRF51XhWB07UdBqN26-iVJrWYUcJy-YONiZQ~YNpGp8FXT1FFSotcFi8~xG1SXb2KeSwSVDOTFooUm5V9pJGWAX1J9ldci-nnGvl6eJjI66dd0k2y3~V1pQ9BNxOlCH8~AUzIGRNyrK7yUDlyw0w__' }, // #20
        { name: 'Berry Blast', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'plasma_berry', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 11, unlocked: false, cost: 90, requires: ['plasma_berry'], iconUrl: 'https://media-hosting.imagekit.io/d90d4b548c2843a4/download%20(21).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=ioSJwnqlKR8cITWsQG7PgVKpsbBT-WN5sX32YEATxp1Lamj8nCxqgOPT9KZHgk44i-BmIsvIVxG-H3YGtOf6xwtbnYWDpIASW~Ft4y3WpG9GRgLq5yU7V6gF-mSJF4byJQIwZ6ghBsJMpD6xAgDPt51w~dL4ka82WM83SmYOzJi87QdVqpQ4C7O~ko4~RlncZoFxUtzXk4Cfg2IgAcJyCyPbEktGbSlu0n-MGYDKCP8M8q3zJMj-~qZ3tx4jaEvxQta7mjNXgK3J1ZsAxCg5TnucndwRD0xmN4dTdbQvfyOgVvqADV~WxChsosmn~NkrYvQDsSv3Y2VrVbHv9Ak07Q__' }, // #21
        { name: 'Static Shock', recipe: [{id: 'synth_gin', count: 1}, {id: 'static_sugar', count: 1}, {id: 'laser_lime', count: 1}], requiresShake: true, needsAging: false, price: 12, unlocked: false, cost: 100, requires: ['static_sugar'], iconUrl: 'https://media-hosting.imagekit.io/2d435256bd6c4ca6/download%20(22).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=ewmXrzknipibHJ9AlnngWRpi3iHkawMsbQ8o3xKPpPa8BUpMOGWa7YLxyjO710AuUgzErBh1Zhns4-5~3Xt6oqfPm5nTiJBLVdhUJT23jKog8D~3kKnA3sE4foadJJTEObwDSGY1~Utdt23wllk59nome2vwqnGTc1EVV7QLlNJuTSJLrgsKmX6cXHLloM2Thxr0gvTlZ8Nb3ZFQoIdWukquBB31H1DGLfUYNs3lauNyHCyvqFhYFBtBjpP5EaUVIrqL~5GHxmYglZXmMcYVs5tj0RiBRaAuiw2dhn2jO5nD9nlLmB~96crqqounj0TCqQafctpzgMwC6vK9BMLyQg__' }, // #22
        { name: 'Sweet Tonic', recipe: [{id: 'glitter_tonic', count: 1}, {id: 'star_syrup', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 6, unlocked: false, cost: 40, requires: ['star_syrup'], iconUrl: 'https://media-hosting.imagekit.io/a8e67a93dd2c4422/download%20(24).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=Oi90i~-Zxb9WFdOU8L6GUJcFYGANvN77iXbQXh~34iQJFHEbIrxCE9mZgSn7N8vxwXdBkoKF58M6w2ZWBQ7obGNTcdxzQV8rZ1-zUBX8mPfKpBcKtdS2zXrm9Jua~bCptMZxScGC2ee0vE4j0HO35RpfSvfrce3bs2R-zTRjxAdFo2f1DCF~nP6BjO79LWMuAQO8zL7eqi-HqQsUT32kjyDi8UlAXc7CR0fkX5S7lA~nkBR87c9U-BIlw3~Iivbv0Vfzur8P4fXTKirMIy9eCITATbsJmOauu6Tsnmp-6ETk0GIQIiQ5HCOEvHW2WkcRu2KSBu1mQHwRRTepwUwOcw__' }, // #23 (URL 24 used for #23)
        { name: 'Double Vodka Cola', recipe: [{id: 'pixel_vodka', count: 2}, {id: 'quantum_cola', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 9, unlocked: false, cost: 60, iconUrl: 'https://media-hosting.imagekit.io/df36c167b1b94f24/download%20(25).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=Pnbjgm~hVzVkqI0pz2hTOsCN-sncqsoR95MNPdwtABrnjSrqMiSMOWJwGgtFG2IIBPdrZ8~4~ZWOhupVile0bqr0SlCDQZ8829j2ku60VgnMySOh7YaDWgOpY1dUWflwkd4IJ4Q4ZqmjQrpLYDV8gaJRxDUip3LUT6GEWCEwX9xMYXwagjytI-7wfvy~Mx2D9sRXIf2nKPhJ7MUepi9SrXRCBO7~Al7BAb64vUkIonjdl2pmPlNJCLz~R8Sze9bS4wJ42XLRlW9pTCFLwO7bdVE9xPNB7A3HfHuWSXcT7NqvRLGxsL7e9-R8AtqjLy40lCF0M7y62L5Nb6fKdgB9Kg__' }, // #24 (URL 25 used for #24)
        { name: 'Mint Condition', recipe: [{id: 'turbo_rum', count: 1}, {id: 'holo_mint', count: 1}, {id: 'bit_lemon', count: 1}, {id: 'ice', count: 1}], requiresShake: true, needsAging: false, price: 11, unlocked: false, cost: 85, requires: ['holo_mint', 'bit_lemon'], iconUrl: 'https://media-hosting.imagekit.io/336a86a79f8d49bd/download%20(26).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=er~LSXbglxDJodlIbENjKuNzPf7~lOpzUBaM1NcCPeUvkl5ZQBaoi5aFsWP29MX-d7RbnmCTEkUUk5MxfCLDa7X7SZ1ACRKObQkNc6Gn5DlmMdVpM0yAsc-rDi~3Vk3RL8ZYqpIIOVVfJoVkykAdozM6k82p9wGQ0Ntlqco1q4kmqOnHDGbl~CqywhLxDrUPGu-nu36vliuFM3j~zg96-0ExI803IU3jPUbdKFZs7BkgX2wT6kdng-IF8Ed0rGUZmrhxkL2fkdZGlHf5V54m8QQUg0IL28pXa--k8iyHoMpUYLy62df8QhcFbzZvLqT9ilmrpFKMMpRQ4QPo5ON5Lw__' }, // #25 (URL 26 used for #25)
        { name: 'Quantum Fizz (Original)', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'quantum_cola', count: 1}, {id: 'bit_lemon', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 6, unlocked: false, cost: 35, requires: ['bit_lemon'], iconUrl: 'https://media-hosting.imagekit.io/391035725f094c17/download%20(27).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=JhwstNxiw59mFNxTIUUZP8dJzb4GIpEdH4BTEAguvxD8Pcf0BZu8Q6l5RlLXgxqBQ3RBepB9i6HK3Ov3yJBR56H~pw0ZxkdASiYT0-XpxY0NhafUcQX3JSO1~uIjE-bhmwhUN4lv1kSUDzo9XnjvqMMJr1L-d8E5-s9f5dM9v1cKC4vtqHsOcL6pcUPUgkaKhqL0q8ZIt146yKS2VpORsiYFxWgjF1amLj1Sp2P0JHj~HionKWqk-aTYFI5YrwSLgwrV0CCM9D6biLZNasPn8EJvFQoLTbqkp1tCZxA2UjrqYUKoGVzDaMqWO6OLMMHb0LNjxaZd~IFAy9S3JhFpwA__' }, // #26 (URL 27 used for #26)
        { name: 'Simple Syrup Splash (Original)', recipe: [{id: 'star_syrup', count: 1}, {id: 'glitter_tonic', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 4, unlocked: false, cost: 45, requires: ['star_syrup'], iconUrl: 'https://media-hosting.imagekit.io/4084abc4b35a48b2/download%20(28).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=1QvFa94kclgIjN5zF6~GiyDrIwg5egCYtT8jfED0uxxKicq2eEQOphACWfu59SpBGvl5auG-yemeIoYhNkycqdf8R7evWD-XT58vzTgIS7s8QeMUjy8g7py09ITSiTfMsN6ym8eY6VFEjdBXPONkxpLaqbuXm9pmsBhW0mzQJjcYL~6JnWmQKZbb4s6NYgQg58pwQ0Qff8ZS-ISzSqSA4lj7S8mtUOtbhnlieUOawJCKKdnQ97qS-68ETwrTXJ9Q-9EHpYF1d-vm1ZK6Sc1VaqpcuGQljOtN~rc7GspPL4Dir2x1~SYiaUm-MYN4jD5S8Mx1QBDk5cnhCvgX7XdGcg__' }, // #27 (URL 28 used for #27)
        { name: 'Rum Runner 3000 (Original)', recipe: [{id: 'turbo_rum', count: 1}, {id: 'laser_lime', count: 1}, {id: 'star_syrup', count: 1}, {id: 'ice', count: 1}], requiresShake: true, needsAging: false, price: 9, unlocked: false, cost: 80, requires: ['star_syrup'], iconUrl: 'https://media-hosting.imagekit.io/8a53b179e6ce4827/download%20(29).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=dzglav5sxdHIwZKJKjGrGcc53VOU~vSalzg8S0H0~X1tLXtdLJLH2QDm3pdHaJDdy8A0-HQpYnPJE8dOIWu42zNNHjCvn-W3tWVmgTPDbpb3DmRLWQaYMHLi2fkA4meRVBdcdORiLI4L88dOHzHlhHwVtcXLvuUThScBw4z~afY~aWIEs3zoq9fdXgBu6qtDb6kyHJ1qL6HRhJ5AxlBGxrgQmc87pEmEQjXvngPkL~k7fA98dlcDEf8gKmoyUp8OAm1lE-jwSrh3TlhVBlfZXImSDbXrw5n3dHZ6bRr0PaBnw4Kpu-nt1N3pan4HnzecpLy5L86klJ-3eDIxunsH5A__' }, // #28 (URL 29 used for #28)
        { name: 'Holo-Mojito (Original)', recipe: [{id: 'turbo_rum', count: 1}, {id: 'laser_lime', count: 1}, {id: 'holo_mint', count: 1}, {id: 'glitter_tonic', count: 1}, {id: 'ice', count: 1}], requiresShake: true, needsAging: false, price: 10, unlocked: false, cost: 90, requires: ['holo_mint'], iconUrl: 'https://media-hosting.imagekit.io/9576aa71c69a4220/download%20(30).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=i-rQFeuJhCJEQY3dbKDfqsfWP0Hh~0nx88EVIBPEZDC2otk4QbnwYH9~eddW0sE6MZ3vL0oil1rW8Ve~RXX0TO7ZeZpjvw0V3bEbA9X3satplJLX0lVvNgJ1r3jXomB8tcg2vuvqKvi9KKfEOc5Hk1eVge-eD0qPPpjChHjpPJ7lYaJjBgT9FlTIsUtsQ0Kc-f1NMR3DMpbcOAhg8SifnIjy50j9QuxO3hH4naJQ4JEQ3-773c-FSB2p~Jsjl4CReGZhfE~MYY51n1U74CVva~mh0R571MUU7uPYZCBZkvBuMmFqftq~DUb4b0~Biuhrcebfc4sr0kKEWCr9Ej1-3g__' }, // #29 (URL 30 used for #29)

        // Tier 2 Locked
        { name: 'Galactic Guardian', recipe: [{id: 'synth_gin', count: 2}, {id: 'nebula_nectar', count: 1}, {id: 'bit_lemon', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 11, unlocked: false, cost: 100, requires: ['bit_lemon'], iconUrl: 'https://media-hosting.imagekit.io/76f2df7e732048ab/download%20(31).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=kpcvSC4-5adRtIKrAothtjeEaZQ-OXSCcivxfzKW5cG95jxKZY3lfNT539jdVXetzbi3gMK2yhNAu7SXPhM224KroCB08R25S8tcCFAxY78BmB31QSAKtIuVdNrlVNgNPdMQzkP6dibJeNxBV6oPBRdZJBHifeKJl2qha5NNlznABn~602PM0ZUgPJgn0XJgb8FOndRcppt6i2go2eXGewV9yAXk-F2rLBE2lUWD8KM39gMwYMWS3Y5n0bGoeZH-81jXxpB2t6jbaikkz~p8BhitaowYMuZlIGdEkSwpecvHCa92U18KhpFe~D~sk4-FRrFo0RerFzNPt0n9aeIKiQ__' }, // #30 (URL 31 used for #30)
        { name: 'Void Berry Fizz', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'cosmic_cranberry', count: 1}, {id: 'void_essence', count: 1}, {id: 'glitter_tonic', count: 1}], requiresShake: false, needsAging: false, price: 15, unlocked: false, cost: 150, requires: ['void_essence'], iconUrl: 'https://media-hosting.imagekit.io/f63956f42d14411a/download%20(32).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=mW9b8LWfpC9-sygT7YcuUBxfGbD0c3GOrzln9V50AFSNML3J6KFm7qkDF0YXkue4cuSC~is3LPCxGfUNxRTDjlFskiCM9tNTZSpWtNnQDcvZ-bvz1wgl-qBmZQhmBUK5uJKCbBQaoArqQb5DhuyEAsLW7-NNR3suaWvcYXfVStpKrm91IoHoZ7Lgy4-~buO~Em9XHFr45KAA3M9S0OKrRaeaqTMa6-93Dgz65An3fNdxxWreFSiuxlRsjFg37McE28DtsyigMNR~NrSMTgVQRhmebKkP-t7azCXv-6S5viYhAJszzK8EGOtS9DM4bwoM2c-PwuFdclZgLadTl-LEkA__' }, // #31 (URL 32 used for #31)
        { name: 'Flux Foam Latte', recipe: [{id: 'turbo_rum', count: 1}, {id: 'star_syrup', count: 1}, {id: 'flux_foam', count: 1}], requiresShake: true, needsAging: false, price: 16, unlocked: false, cost: 160, requires: ['star_syrup', 'flux_foam'], iconUrl: 'https://media-hosting.imagekit.io/4729c9f6c24249ed/download%20(33).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=Z1uUpkre3O94-bBcUzd1eGzg90s4NBwxY55KRO9pFeI1Dqp7tMcVC~VyZV10f~Tvf5lO4L18FnJoKMZIVvqh6X0QsxUh8sSn0a83IkMaSmGxjvQfIb~2bY5in~Ybz6L~SWr-eWk78~A8i2p5D-x1VJ7NWiVu8b1KDxa6SzPlU~esTknHBZZ~LDf0caI-uCOYG4wYNJBvK20Dm-eJH5XnLW6SsHZqRyhUJm07nUh2ROMbJyKe2wcVLmH6h853iIw2BOa0Iz7DD~iZeHT8ewsGBwcKkqDsJzptw9pr5M3Pzcgi-emtX6tKsfobCvi-~~e9nsZoG9maYpjQaP2ex~46DA__' }, // #32 (URL 33 used for #32)
        { name: 'Double Mint Cooler', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'holo_mint', count: 2}, {id: 'glitter_tonic', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 12, unlocked: false, cost: 110, requires: ['holo_mint'], iconUrl: 'https://media-hosting.imagekit.io/a18dabd2c1544cc3/download%20(34).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=j74TK9P-ZD6sTdBtfcFwYeQLisaQYJ-RPfTGfe0wewUntf1h0VhKaZe-4J4mQjFHS2faCik4RGCqsPzotE~KIQsgXlT3i~yXMpRUUphQIRuwHdU8Pauvds38aMR-gwo8nsn-YL7awHROPIEBeuFc1Qs-RZf2vethdtz7V1tx5ZhUMKL~9pam4AMA-yldxX2qPg-gORSDHQSLhGPqGWIrwVVnnjbdGvLSXj3uxier50LpSzCy3tFgiYeUnFwT5DUmjnRPSUNC4wddrnvijEoLrVrbNpiZVz2cdIYpBCGU4N2sCVCspfnJR8xyMWIFImplvjbh26NcwsmtFhe9EqnlkA__' }, // #33 (URL 34 used for #33)
        { name: 'Chrono Cherry Sour', recipe: [{id: 'synth_gin', count: 1}, {id: 'cryo_cherry', count: 1}, {id: 'bit_lemon', count: 1}, {id: 'chrono_cordial', count: 1}], requiresShake: true, needsAging: false, price: 18, unlocked: false, cost: 200, requires: ['cryo_cherry', 'bit_lemon', 'chrono_cordial'], iconUrl: 'https://media-hosting.imagekit.io/d7584bcb1b434ae5/download%20(35).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=AurHoRvyKLc1K4GhO-yH5azpQNmvREQx0kE8WoPOzZrqSu4ocV3b9sINwqdJNSQ-8Jy8n0SyqarLibq7j0wJSuhTwfpiqoUCkrWGLCleFWcPPELUy-ze5g6gjDafcx2P7ROGXU~wy9cutTQMG8eNSoaArpKrnr5oesd7jWo9iXgwMN81T1F1QBF~QzTXdJoohXOz0am5pmVOMrb3AWmqhpIuS0NbnSwDBFdvdefafbSb9ld83HEBCT0k09bjYR5u~ljsdSJ1U0fLK8uk5aDDfJOWf3o1FGC5ODMTXp7KUnTh5arc~5zuiibHDkHK5TspGzaH9RZ21BhmFRaW~A~rmA__' }, // #34 (URL 35 used for #34)
        { name: 'Orange Nebula Shake', recipe: [{id: 'turbo_rum', count: 1}, {id: 'plasma_orange', count: 1}, {id: 'nebula_nectar', count: 1}, {id: 'flux_foam', count: 1}], requiresShake: true, needsAging: false, price: 17, unlocked: false, cost: 180, requires: ['flux_foam'], iconUrl: 'https://media-hosting.imagekit.io/aaa887476d8f4fda/download%20(36).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=cmEIK~tjDfQw0AqWZiwYUxB-q0BE6kdo5oEc8ccLB~blIK8iNkWVIUfmyD5ShJyJOVNNLC5627dBeM18pbaamKnENV4OW0zQuDBpVesjPyVLHABZWsZ2lkhEEAGEtHUv~SJ2HcLjkKixC7SLA3jSfxLwZGjKR-otl~4P6t93jFqak9B~aE8Ez5tTyZF5aVb2hUzUZDmBa6ctMTnfe8Udx6RxXBSiZqg7AgztjYIFaq6fcCi9u2o7KJz5O~zCJheJ8efP0xIhu77jAuxaG3fEw2WgGzMhPH1c-vOA5nGuit7PKlwQg-wlRzvNWU7Fguoc1oF-lXniTA8zvJhzKO0DxA__' }, // #35 (URL 36 used for #35)
        { name: 'Star Syrup Supreme', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'star_syrup', count: 2}, {id: 'laser_lime', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 14, unlocked: false, cost: 140, requires: ['star_syrup'], iconUrl: 'https://media-hosting.imagekit.io/1c68962bea314de2/download%20(37).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=qc~T6si7GuX8dCq0nXsuoITMJjogOuwGurybks~Kuq~2ZXhKfxK3WUic4zEC7At8Qn6BNXz4PGmpsWB0IMryE4mUn~lwqzH8M8VgC6dG9XAAO43LvOwyZuTCDZwynHn475mnD~Cq820GDm1HjIT302GeIM1swZu9aoaKa3QX~aYNLkwetpQpTfrYlkPwJ3v6-eKXpR~h~Avbp21qHuMcQ77fwTZxOuVwhc5~GGjSDNwIo5ETZLQ-cyi67ZsEKqGLMAXt-CrunHKY7-H6g0zMZ69pLV2r14e6owLfObWh8s8uhWKUVyLsB3WqwhX8-bIWUUmgh6gPPMOEh6BWabbiQw__' }, // #36 (URL 37 used for #36)
        { name: 'Quantum Leap', recipe: [{id: 'synth_gin', count: 1}, {id: 'quantum_cola', count: 1}, {id: 'void_essence', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 16, unlocked: false, cost: 170, requires: ['void_essence'], iconUrl: 'https://media-hosting.imagekit.io/fece7c81956c4860/download%20(38).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=V6OqJJlMWxGVFY-DnYMi-EibKWObZiKaEzow-g0z5oAivNBKyi7IM3sFBiphNKHP4HTGgEo5OA3Y737apTvcbafSVpPDoxnDMcLxzmr8-hVglAq6M6tTXFdRPD9eKiqOKQv51QXpE-UZBDmUfHTXCxWBTSCOpT-Cqbgbv9NoiWrpoL8qqAmqvzPufIryFhDPR~g-BhVGQY1vTiqcbPkbL8DsxV-CIuVPRzyPUNMbeVZdZL9ssBUlKdO5yIyM~mJV5QkP67toS1Y3vThBP6DJMGxBk73K5S6Pfwxz8yxIKX3cosqK3ypNTeIkTNhvp58hudgrp7QXP0NEDPGNvyOKuQ__' }, // #37 (URL 38 used for #37)
        { name: 'Frozen Time', recipe: [{id: 'pixel_vodka', count: 2}, {id: 'chrono_cordial', count: 1}, {id: 'ice', count: 1}], requiresShake: true, needsAging: false, price: 19, unlocked: false, cost: 220, requires: ['chrono_cordial'], iconUrl: 'https://media-hosting.imagekit.io/ff391dab6c3b4ad5/download%20(39).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=v1xM8FU0j1Ou6vZX~pOLjO5A7~2VswPX0xlHLp~BE0CDIs77Wfv0ooyUkO0nobwBLf5sH3tHzGKH3JqsR5Ntj4AhTNhMCERj7-U3mL0fto~CT4xBsWb1EFHaOjW3SM7YA4jgCCnNfAQboGP0RLE9m~GTpXdj4zqksd31FhQFv4rlFgP1iZg4JX43DguN14v6ZnRUdBJ2-8aWsRsvcklgX95XDdS0vy1~LTNRwI21MQ7TTuwUGr70qM1Guow2wNPdde64xpgC2qpfeLNXqeUnvWQbSpFf7EuQMr4FRUOQ~4P~lNnSTQltZInJVT1VEDVt7rfoTi2KaZDt1dnQAAbhbA__' }, // #38 (URL 39 used for #38)
        { name: 'Essence of Mint', recipe: [{id: 'turbo_rum', count: 1}, {id: 'holo_mint', count: 1}, {id: 'void_essence', count: 1}, {id: 'ice', count: 1}], requiresShake: true, needsAging: false, price: 18, unlocked: false, cost: 190, requires: ['holo_mint', 'void_essence'], iconUrl: 'https://media-hosting.imagekit.io/78019c080bda4757/download%20(40).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=aPmcln61L-dEKxHhFNUGHLlZaNdTKnMr6z~ZQ92npOfWcGMe-Oa8OxA-lTpGYl3ihuKgkpSLhQxHuohkLllU6yRJCQoTDwj6HIwjNaZyims-Hh-MCsp-jJNKomqzsrAwbUHo1vUajnWz0sop7GP6s9l1uyvCBffWeZION4USLbGmvgBzpcM4lP69nPB-d2pa88Mq-vVkK~VXs2ctLE1-sBJDRcJZ2J6O6GsMG1VTlBh0XQcud-J6uJpOE76DWqywvqPAyBueHz997RPYx-NYI~n~CUtepY6jXQ7yRCIzKvAqkdX3NPo7w~AW7wNGECZ2vg66y2nAJsZzlmxQmZeGMg__' }, // #39 (URL 40 used for #39)
        { name: 'Plasma Berry Twist', recipe: [{id: 'synth_gin', count: 1}, {id: 'plasma_berry', count: 1}, {id: 'laser_lime', count: 1}, {id: 'ice', count: 1}], requiresShake: true, needsAging: false, price: 13, unlocked: false, cost: 120, requires: ['plasma_berry'], iconUrl: 'https://media-hosting.imagekit.io/66ac42e7c0b743c6/download%20(41).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=JaNWXtuaJurOtAEjSyu7r1OlQUxjqlYLc6b5byNbWSxZCcwdLyZjQWA9dwjp3ym6GCcyKhdHrQeQzac7~FF2rDBUANmOyw5V4r0z5XefGmh3IjchrFHHsQ3wDJqv6F5KEXu4QWH27ar0BkATG2WgGhWdxXPR4wy5ZDU3~r4UfEm2ndNjiMVZ3L60M3Yir28qsWJsmI~4nI84h1NuLbS~l8LrvSCICFnyTvwiud1fZmrc2ikz0VoDYWCoCEnbolzHFJJi9GHTwBaq7UNg0nlE17qQdZV3zSM~7lheyWtsEYE~mZS40UT5~g9MKgu9z8sW5Vu63cYxDe2hxMP989hWDw__' }, // #40 (URL 41 used for #40)
        { name: 'Static Berry Fizz', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'plasma_berry', count: 1}, {id: 'static_sugar', count: 1}, {id: 'glitter_tonic', count: 1}], requiresShake: false, needsAging: false, price: 15, unlocked: false, cost: 160, requires: ['plasma_berry', 'static_sugar'], iconUrl: 'https://media-hosting.imagekit.io/e0795d5b6cb04d63/download%20(42).png?Expires=1841077162&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=ykjTRLUCKSkn0tkKi97o4Dr0RAXSgLVeSOlNXBFJaGdyhLzZpV6OIB4Pc8CkDY97IhTICy7sG2hTkkGWO15KVqUulne5qrfQHf1cja9~-frOrbHyEWdk1Kp9Faow2Z2H8GyG5rb4rLxgxtLmk-eV9dyb7c~fQiBkoHxk6EcRrp6rAjUXr3797dcCF4wpKVgZ8sELP7SQuL4e4HcyhALROvJEkWNLeFqqWJGj53nWC6prsUAB7ZlfJnp6WKqs96kmiD2ZAcjSVnJMCTTgeTmQFpKYLtt57Ha8w8hdtv8w-GM~3lJ57xs3v3HpLNfQI67391qyJvc8l8xsrdQlNjdzcA__' }, // #41 (URL 42 used for #41)
        // --- Drinks past this point will not have unique icons currently ---
        
        { name: 'Gravity Well', recipe: [{id: 'gravity_gin', count: 1}, {id: 'nebula_nectar', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 22, unlocked: false, cost: 280, requires: ['gravity_gin'], iconUrl: null }, // #42
        { name: 'Sugar Rush', recipe: [{id: 'turbo_rum', count: 1}, {id: 'static_sugar', count: 2}, {id: 'quantum_cola', count: 1}], requiresShake: false, needsAging: false, price: 14, unlocked: false, cost: 150, requires: ['static_sugar'], iconUrl: null }, // #43
        { name: 'Chrono Cola', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'quantum_cola', count: 1}, {id: 'chrono_cordial', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 20, unlocked: false, cost: 240, requires: ['chrono_cordial'], iconUrl: null }, // #44
        { name: 'The Void Walker', recipe: [{id: 'synth_gin', count: 2}, {id: 'void_essence', count: 1}, {id: 'chrono_cordial', count: 1}], requiresShake: true, needsAging: true, price: 25, unlocked: false, cost: 300, requires: ['void_essence', 'chrono_cordial'], iconUrl: null }, // #45 Needs Aging!
        { name: 'Flux Capacitor', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'flux_foam', count: 1}, {id: 'chrono_cordial', count: 1}, {id: 'star_syrup', count: 1}], requiresShake: true, needsAging: false, price: 28, unlocked: false, cost: 350, requires: ['flux_foam', 'chrono_cordial', 'star_syrup'], iconUrl: null }, // #46
        { name: 'Nebula Overload', recipe: [{id: 'turbo_rum', count: 2}, {id: 'nebula_nectar', count: 2}, {id: 'void_essence', count: 1}, {id: 'ice', count: 1}], requiresShake: false, needsAging: false, price: 26, unlocked: false, cost: 320, requires: ['void_essence'], iconUrl: null }, // #47
        { name: 'Cryo Chrono Blast', recipe: [{id: 'synth_gin', count: 1}, {id: 'cryo_cherry', count: 2}, {id: 'chrono_cordial', count: 1}, {id: 'ice', count: 1}], requiresShake: true, needsAging: false, price: 24, unlocked: false, cost: 280, requires: ['cryo_cherry', 'chrono_cordial'], iconUrl: null }, // #48
        { name: 'Ultimate Cosmo', recipe: [{id: 'pixel_vodka', count: 2}, {id: 'cosmic_cranberry', count: 1}, {id: 'laser_lime', count: 1}, {id: 'void_essence', count: 1}, {id: 'ice', count: 1}], requiresShake: true, needsAging: false, price: 27, unlocked: false, cost: 330, requires: ['void_essence'], iconUrl: null }, // #49
        { name: 'Zero-G', recipe: [{id: 'gravity_gin', count: 1}, {id: 'flux_foam', count: 1}, {id: 'ice', count: 1}], requiresShake: true, needsAging: true, price: 30, unlocked: false, cost: 400, requires: ['gravity_gin', 'flux_foam'], iconUrl: null }, // #50 Needs Aging!
        { name: 'Static Void', recipe: [{id: 'pixel_vodka', count: 1}, {id: 'void_essence', count: 1}, {id: 'static_sugar', count: 1}], requiresShake: false, needsAging: false, price: 23, unlocked: false, cost: 290, requires: ['void_essence', 'static_sugar'], iconUrl: null }, // #51
        { name: 'Berry Singularity', recipe: [{id: 'gravity_gin', count: 1}, {id: 'plasma_berry', count: 2}, {id: 'void_essence', count: 1}], requiresShake: true, needsAging: true, price: 32, unlocked: false, cost: 450, requires: ['gravity_gin', 'plasma_berry', 'void_essence'], iconUrl: null }, // #52 Needs Aging!
        { name: 'Chrono Flux', recipe: [{id: 'turbo_rum', count: 1}, {id: 'chrono_cordial', count: 1}, {id: 'flux_foam', count: 1}, {id: 'laser_lime', count: 1}], requiresShake: true, needsAging: false, price: 29, unlocked: false, cost: 380, requires: ['chrono_cordial', 'flux_foam'], iconUrl: null }, // #53
        { name: 'The CYBERBAR Special', recipe: [{id: 'gravity_gin', count: 1}, {id: 'void_essence', count: 1}, {id: 'chrono_cordial', count: 1}, {id: 'static_sugar', count: 1}, {id: 'flux_foam', count: 1}], requiresShake: true, needsAging: true, price: 50, unlocked: false, cost: 750, requires: ['gravity_gin', 'void_essence', 'chrono_cordial', 'static_sugar', 'flux_foam'], iconUrl: null }, // #54 Needs Aging!
    ];

    // --- Bar Upgrades ---
    // AGING FEATURE: Includes the 'aging_rack' upgrade definition
    barUpgrades = {
        entertainment: { name: "Holo-Jukebox", description: "Customers are more patient with better tunes.", levels: [{ cost: 100, timeBonus: 5 }, { cost: 250, timeBonus: 10 }, { cost: 500, timeBonus: 15 }], currentLevel: 0 },
        seating: { name: "Expanded Seating", description: "More comfy seats might lead to better tips.", levels: [{ cost: 150, tipBonus: 1 }, { cost: 400, tipBonus: 2 }, { cost: 800, tipBonus: 3 }], currentLevel: 0 },
        aging_rack: { name: "Chrono-Aging Rack", description: "Unlocks the ability to serve premium aged cyber-spirits.", levels: [{ cost: 500, enabled: true }], currentLevel: 0 }
    };

    // --- Bartender Skills ---
    bartenderSkills = {
        efficiency: { name: "Smooth Service", description: "Expert pouring and presentation fetches higher prices.", levels: [{ cost: 80, moneyMultiplier: 1.1 }, { cost: 200, moneyMultiplier: 1.2 }, { cost: 450, moneyMultiplier: 1.3 }], currentLevel: 0 },
        shaking: { name: "Speed Shaking", description: "Reduces the time required to perfectly shake drinks.", levels: [{ cost: 120, shakeTimeReduction: 100 }, { cost: 300, shakeTimeReduction: 200 }, { cost: 600, shakeTimeReduction: 300 }], currentLevel: 0 }
    };

    // --- Customer Reviews Pool ---
    reviewPool = { // As defined in your previous version
        goodServe: ["Perfect drink! Just what I needed.", "This place rocks! Great service.", "Wow, nailed the recipe!", "CYBERBAR is the best!", "Exactly right, and fast too!", "Delicious! 5 Stars!", "My circuits feel refreshed.", "Worth the wait!", "Tastes like pure data joy."],
        badServe: ["Ugh, this isn't what I ordered.", "Did you even listen? Wrong drink!", "Tastes... synthetic. And wrong.", "My disappointment is immeasurable.", "Close, but no data-cigar.", "Needs more [random ingredient].", "Error 404: Drink not found.", "This wasn't shaken right!", "Did you forget to age this?", "Too many ingredients!", "Missing something...", "This is just synth-sludge!"],
        timeout: ["Took too long! I'm out.", "Service is slower than a dial-up modem.", "I haven't got all cycle! Bye.", "Is the bartender AFK?", "My patience has expired.", "This waiting is illogical.", "I'll take my credits elsewhere."],
        miscGood: ["Cool atmosphere here.", "Love the neon vibes!", "The music is bumping!", "Finally, a decent bar in this sector.", "That jukebox is playing my jam!", "Glad they added more seats."],
        miscBad: ["Bit cramped in here.", "Could use more seating.", "The jukebox needs new tracks.", "This place needs an upgrade.", "The wait times can be long."]
    };

    // --- End of Block 2 ---
    // ==================================
    // BLOCK 3: CORE UTILITY FUNCTIONS
    // ==================================

    /**
     * Displays a message to the player in the message box.
     * @param {string} msg - The message text.
     * @param {string} [color='var(--text-color)'] - Optional CSS color for the message.
     */
    function showMessage(msg, color = 'var(--text-color)') {
        if (messageBox) {
            messageBox.textContent = msg;
            messageBox.style.color = color;
            // Determine glow based on specific colors or use a default from CSS variables
            if (color === 'var(--neon-green)') {
                messageBox.style.textShadow = 'var(--text-glow-green)';
            } else if (color === 'var(--neon-pink)') {
                messageBox.style.textShadow = 'var(--text-glow-pink)';
            } else if (color === 'var(--neon-orange)') {
                messageBox.style.textShadow = 'var(--text-glow-orange)';
            } else if (color === 'var(--neon-blue)') {
                messageBox.style.textShadow = 'var(--text-glow-cyan)';
            } else {
                messageBox.style.textShadow = 'none'; // No glow for default or unspecified text colors
            }
        } else {
            console.warn("DOM Element: messageBox not found!");
        }
    }

    /**
     * Formats hour and minute into HH:MM format (24-hour).
     * @param {number} hour - The hour (0-23).
     * @param {number} minute - The minute (0-59).
     * @returns {string} Formatted time string.
     */
    function formatTime(hour, minute) {
        const paddedHour = String(hour).padStart(2, '0');
        const paddedMinute = String(minute).padStart(2, '0');
        return `${paddedHour}:${paddedMinute}`;
    }

    /** Updates the game clock and day display in the header. */
    function updateClockDisplay() {
        if (gameTimeDisplay) {
            gameTimeDisplay.textContent = `Time: ${formatTime(gameHour, gameMinute)}`;
        }
        if (gameDayDisplay) {
            gameDayDisplay.textContent = `Day: ${currentDay}`;
        }
    }

    /** Updates static UI displays (Score, Money, Skill/Upgrade Levels summary). */
    function updateStaticUIDisplays() {
        if (scoreDiv) scoreDiv.textContent = `Score: ${score}`;
        if (moneyDiv) moneyDiv.textContent = `Cash: $${money}`;

        if (skillLevelDisplay && bartenderSkills.efficiency && bartenderSkills.shaking) {
             skillLevelDisplay.textContent = `Skills: Service L${bartenderSkills.efficiency.currentLevel}, Shaking L${bartenderSkills.shaking.currentLevel}`;
        }
        if (upgradeLevelDisplay && barUpgrades.entertainment && barUpgrades.seating && barUpgrades.aging_rack) {
            let upgradeText = `Upgrades: Jukebox L${barUpgrades.entertainment.currentLevel}, Seating L${barUpgrades.seating.currentLevel}`;
            // AGING FEATURE: Reflects aging rack upgrade in UI summary
            if (barUpgrades.aging_rack.currentLevel > 0) {
                upgradeText += `, Aging Rack`;
            }
            // Reflect worker status
            if (hiredWorker) {
                 upgradeText += `, Worker Hired`;
            }
            upgradeLevelDisplay.textContent = upgradeText;
        }
    }

    /** Updates the visual representation of ingredients in the mixing station and related buttons. */
    function updateMixingArea() {
        if (!mixedIngredientsDisplay) {
             console.error("DOM Element: mixedIngredientsDisplay not found!");
             return;
        }

        mixedIngredientsDisplay.innerHTML = ''; // Clear previous items
        if (selectedIngredients.length > 0) {
            selectedIngredients.forEach(item => {
                const ingredientData = allIngredients.find(i => i.id === item.id);
                if (ingredientData) {
                    const span = document.createElement('span');
                    span.classList.add('mixed-ingredient');
                    span.style.setProperty('--ingredient-color', ingredientData.color || 'var(--neon-green)');
                    // Updated to always show count, e.g., "1x Ingredient", "2x Ingredient"
                    span.textContent = `${item.count}x ${ingredientData.name}`;
                    mixedIngredientsDisplay.appendChild(span);
                }
            });
        }
        // CSS can handle :empty state for #mixed-ingredients-display if a placeholder is desired

        // Update button states
        const hasIngredients = selectedIngredients.length > 0;
        if (clearBtn) clearBtn.disabled = !hasIngredients || !isBarOpen;
        if (shakeBtn) shakeBtn.disabled = !hasIngredients || !isBarOpen || isShaken;
        if (serveBtn) serveBtn.disabled = !currentCustomer || !hasIngredients || !isBarOpen;
    }

    /** Clears the current selection of ingredients and resets mix state. */
    function clearMix() {
        selectedIngredients = [];
        isShaken = false;

        if (mixedIngredientsDisplay) {
            mixedIngredientsDisplay.innerHTML = '';
        }

        if (mixerImageVisual) { // The element that actually animates
            mixerImageVisual.classList.remove('mixing-gentle', 'mixing-shake');
        } else {
             console.warn("DOM Element: mixerImageVisual not found to remove animations.");
        }

        updateMixingArea(); // Update display (now empty) and button states
        if (isBarOpen && gameActive) { // Only show message if bar is open and game is active
             showMessage("Mix cleared.", "var(--neon-blue)");
        }
    }

     /**
      * Triggers a customer emotion animation and popup.
      * @param {'happy' | 'angry'} emotion - The emotion to display.
      * @param {boolean} [temporary=true] - If true, the emotion fades after a short delay.
      */
     function triggerCustomerEmotion(emotion, temporary = true) {
         if (!emotionPopup || !customerIcon) return;

         const popupClass = emotion;
         const iconAnimationClass = emotion;
         const animationDuration = 650; // Should match CSS animation timing

         emotionPopup.classList.remove('visible', 'happy', 'angry');
         customerIcon.classList.remove('happy', 'angry');
         customerIcon.style.animation = 'none'; // Explicitly stop any current CSS animation

         void customerIcon.offsetWidth; // Force reflow - helps ensure animation restarts correctly

         setTimeout(() => {
             emotionPopup.classList.add(popupClass, 'visible');
             customerIcon.classList.add(iconAnimationClass); // This class applies the animation via CSS

             setTimeout(() => {
                 // Only remove classes if they haven't been changed by a subsequent call
                 if (customerIcon.classList.contains(iconAnimationClass)) {
                      customerIcon.classList.remove(iconAnimationClass);
                 }
                 if (temporary && emotionPopup.classList.contains(popupClass)) {
                     emotionPopup.classList.remove('visible', popupClass);
                 }
             }, animationDuration);
         }, 10); // Short delay for reflow
     }

    /** Clears the customer display area (icon, bubble, emotion) to default. */
    function clearCustomerDisplay() {
          console.error("!!!! clearCustomerDisplay CALLED !!!! - Hiding customer visuals."); // Use error to make it stand out
        if (customerIcon) {
            const placeholderSrc = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            customerIcon.src = placeholderSrc;
            customerIcon.alt = "Customer Area";
            customerIcon.className = ''; // Remove .vip, .happy, .angry
            customerIcon.style.animation = 'none'; // Ensure animations are stopped
        }
        if (chatBubble) {
            chatBubble.textContent = '...';
            const defaultColor = 'var(--neon-green)';
            chatBubble.style.borderColor = defaultColor;
            chatBubble.style.color = defaultColor;
            chatBubble.style.textShadow = 'var(--text-glow-green)';
            chatBubble.style.setProperty('--chat-bubble-border-color', defaultColor); // Reset pointer
        }
        if (emotionPopup) {
            emotionPopup.classList.remove('visible', 'happy', 'angry');
        }
        if (timerDisplay) { // Reset timer display along with customer
             timerDisplay.textContent = `Order Time: --`;
             timerDisplay.style.color = 'var(--neon-orange)';
             timerDisplay.style.textShadow = 'var(--text-glow-orange)';
        }
    }

    // --- End of Block 3 ---
    // ==================================
    // BLOCK 4: TAB UPDATE FUNCTIONS
    // ==================================

    /** Safely remove any loading message placeholder from a container */
    function removeLoadingMessage(container) {
        const loadingMsg = container?.querySelector('.loading-message');
        if (loadingMsg) {
            loadingMsg.remove();
        }
    }

    /** Updates the Recipe Pamphlet tab with known/unlocked drinks. */
    function updateRecipePamphlet() {
        if (!recipePamphletDiv) {
            console.error("DOM Element: recipePamphletDiv not found!");
            return;
        }
        removeLoadingMessage(recipePamphletDiv);
        recipePamphletDiv.innerHTML = ''; // Clear previous content

        const knownDrinks = allDrinks.filter(drink => drink.unlocked);

        if (knownDrinks.length === 0) {
            recipePamphletDiv.innerHTML = '<p class="loading-message">No recipes learned yet. Explore and unlock more drinks!</p>';
            return;
        }

        knownDrinks.forEach(drink => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('list-item');

            let ingredientsHTML = '<ul>';
            drink.recipe.forEach(ingDetail => {
                const ingredient = allIngredients.find(i => i.id === ingDetail.id);
                // Updated format for ingredient quantity: "1x Ingredient Name"
                ingredientsHTML += `<li>${ingDetail.count}x ${ingredient ? ingredient.name : ingDetail.id}</li>`;
            });
            ingredientsHTML += '</ul>';

            let indicators = '';
            if (drink.requiresShake) {
                indicators += '<span class="shake-indicator">Shake Well!</span>';
            }
            if (drink.needsAging) { // AGING FEATURE: Display indicator
                indicators += '<span class="age-indicator">Needs Aging!</span>';
            }

            const iconSrc = drink.iconUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Fallback transparent pixel

            itemDiv.innerHTML = `
                <h4>
                    <img src="${iconSrc}" alt="${drink.name}" class="drink-icon">
                    <span class="drink-name">${drink.name}</span>
                    <span class="cost">$${drink.price}</span>
                </h4>
                <p><strong>Recipe:</strong></p>
                ${ingredientsHTML}
                ${indicators}
            `;
            recipePamphletDiv.appendChild(itemDiv);
        });
    }

    /** Updates the Unlocks tab with purchasable ingredients and drinks. */
    function updateUnlocksTab() {
        if (!unlocksListDiv) {
            console.error("DOM Element: unlocksListDiv not found!");
            return;
        }
        removeLoadingMessage(unlocksListDiv);
        unlocksListDiv.innerHTML = '';

        let itemsAvailableToUnlock = 0;

        // Ingredients to unlock
        allIngredients.forEach(ingredient => {
            if (!ingredient.unlocked && ingredient.cost > 0) {
                itemsAvailableToUnlock++;
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('list-item');
                itemDiv.innerHTML = `
                    <h4>
                        <span class="drink-name">${ingredient.name} (Ingredient)</span>
                        <span class="cost">$${ingredient.cost}</span>
                    </h4>
                    <p>Unlocks a new ingredient for mixing.</p>
                    <button class="buy-btn" data-type="ingredient" data-id="${ingredient.id}" ${money < ingredient.cost ? 'disabled' : ''}>
                        Unlock Ingredient
                    </button>
                `;
                unlocksListDiv.appendChild(itemDiv);
            }
        });

        // Drinks to unlock
        allDrinks.forEach(drink => {
            if (!drink.unlocked && drink.cost > 0) {
                let canUnlock = true; // Check if all requirements are met to unlock this recipe
                // Check if recipe ingredients are unlocked
                canUnlock = drink.recipe.every(recIng => allIngredients.find(i => i.id === recIng.id)?.unlocked);
                 // Check additional explicit 'requires' if they exist
                 if (canUnlock && drink.requires && drink.requires.length > 0) {
                     canUnlock = drink.requires.every(reqId => allIngredients.find(i => i.id === reqId)?.unlocked);
                 }

                itemsAvailableToUnlock++; // Increment even if not immediately craftable, to show it in the list
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('list-item');

                let ingredientsHTML = '<ul>';
                drink.recipe.forEach(ingDetail => {
                    const ingredient = allIngredients.find(i => i.id === ingDetail.id);
                    // Updated format for ingredient quantity: "1x Ingredient Name"
                    ingredientsHTML += `<li>${ingDetail.count}x ${ingredient ? ingredient.name : ingDetail.id}</li>`;
                });
                ingredientsHTML += '</ul>';

                let requirementText = '';
                 if (!canUnlock) { // If cannot unlock yet, list missing requirements
                     const missingReqs = [];
                     drink.recipe.forEach(recIng => { // Check recipe ingredients
                         const ing = allIngredients.find(i => i.id === recIng.id);
                         if (!ing || !ing.unlocked) missingReqs.push(ing?.name || recIng.id);
                     });
                     if (drink.requires && drink.requires.length > 0) { // Check additional 'requires'
                         drink.requires.forEach(reqId => {
                             const reqIng = allIngredients.find(ing => ing.id === reqId);
                             if (reqIng && !reqIng.unlocked && !missingReqs.includes(reqIng.name)) { // Avoid duplicates
                                 missingReqs.push(reqIng.name);
                             }
                         });
                     }
                     const uniqueMissing = [...new Set(missingReqs)]; // Ensure unique list
                     if (uniqueMissing.length > 0) {
                         requirementText = `<p><em style="color: var(--neon-pink);">Requires Unlocked: ${uniqueMissing.join(', ')}</em></p>`;
                     }
                 }
                 const iconSrc = drink.iconUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

                itemDiv.innerHTML = `
                    <h4>
                        <img src="${iconSrc}" alt="${drink.name}" class="drink-icon">
                        <span class="drink-name">${drink.name} (Recipe)</span>
                        <span class="cost">$${drink.cost}</span>
                    </h4>
                    <p><strong>Recipe:</strong></p>
                    ${ingredientsHTML}
                    ${requirementText}
                    <button class="buy-btn" data-type="drink" data-id="${drink.name}" ${money < drink.cost || !canUnlock ? 'disabled' : ''} title="${!canUnlock ? 'Unlock required ingredients first!' : 'Click to unlock this recipe'}">
                        Unlock Recipe
                    </button>
                `;
                unlocksListDiv.appendChild(itemDiv);
            }
        });

        if (itemsAvailableToUnlock === 0) {
            unlocksListDiv.innerHTML = '<p class="loading-message">All available items unlocked for now!</p>';
        }
    }

    /** Updates the Upgrades tab with available bar upgrades. */
    function updateUpgradesTab() {
        if (!upgradesListDiv) { console.error("DOM Element: upgradesListDiv not found!"); return; }
        removeLoadingMessage(upgradesListDiv);
        upgradesListDiv.innerHTML = '';

        if (Object.keys(barUpgrades).length === 0) {
             upgradesListDiv.innerHTML = '<p class="loading-message">No upgrades available.</p>'; return;
        }
        Object.keys(barUpgrades).forEach(key => {
            const upgrade = barUpgrades[key];
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('list-item');
            let levelInfo = '';
            let buyButtonHTML = '';
            const currentLevel = upgrade.currentLevel;
            const maxLevel = upgrade.levels.length;

            if (currentLevel < maxLevel) {
                const nextLevelData = upgrade.levels[currentLevel];
                const cost = nextLevelData.cost;
                let effectDescription = '';
                if (nextLevelData.timeBonus !== undefined) effectDescription = `Next Lvl: +${nextLevelData.timeBonus}s order time.`;
                if (nextLevelData.tipBonus !== undefined) effectDescription = `Next Lvl: +$${nextLevelData.tipBonus} tip potential.`;
                if (nextLevelData.enabled !== undefined) effectDescription = `Unlocks ability.`; // For aging rack

                levelInfo = `<p>Current Level: ${currentLevel} / ${maxLevel}</p><p>${effectDescription}</p>`;
                buyButtonHTML = `<button class="buy-btn" data-type="upgrade" data-id="${key}" ${money < cost ? 'disabled' : ''}>Upgrade ($${cost})</button>`;
            } else {
                levelInfo = `<p>Current Level: ${currentLevel} / ${maxLevel} (Maxed)</p>`;
                buyButtonHTML = `<button class="buy-btn maxed" disabled>Max Level</button>`;
            }

            itemDiv.innerHTML = `
                <h4>${upgrade.name}</h4>
                <p>${upgrade.description}</p>
                ${levelInfo}
                ${buyButtonHTML}
            `;
            upgradesListDiv.appendChild(itemDiv);
        });
    }

    /** Updates the Skills tab with available bartender skills. */
    function updateSkillsTab() {
        if (!skillsListDiv) { console.error("DOM Element: skillsListDiv not found!"); return; }
        removeLoadingMessage(skillsListDiv);
        skillsListDiv.innerHTML = '';

        if (Object.keys(bartenderSkills).length === 0) {
             skillsListDiv.innerHTML = '<p class="loading-message">No skills available.</p>'; return;
        }
        Object.keys(bartenderSkills).forEach(key => {
            const skill = bartenderSkills[key];
             const itemDiv = document.createElement('div');
            itemDiv.classList.add('list-item');
            let levelInfo = '';
            let buyButtonHTML = '';
            const currentLevel = skill.currentLevel;
            const maxLevel = skill.levels.length;

            if (currentLevel < maxLevel) {
                const nextLevelData = skill.levels[currentLevel];
                const cost = nextLevelData.cost;
                let effectDescription = '';
                if (nextLevelData.moneyMultiplier !== undefined) effectDescription = `Next Lvl: Drink price x${nextLevelData.moneyMultiplier}.`;
                if (nextLevelData.shakeTimeReduction !== undefined) effectDescription = `Next Lvl: Shake time -${nextLevelData.shakeTimeReduction / 1000}s.`;

                levelInfo = `<p>Current Level: ${currentLevel} / ${maxLevel}</p><p>${effectDescription}</p>`;
                buyButtonHTML = `<button class="buy-btn" data-type="skill" data-id="${key}" ${money < cost ? 'disabled' : ''}>Upgrade ($${cost})</button>`;
            } else {
                levelInfo = `<p>Current Level: ${currentLevel} / ${maxLevel} (Maxed)</p>`;
                buyButtonHTML = `<button class="buy-btn maxed" disabled>Max Level</button>`;
            }

            itemDiv.innerHTML = `
                <h4>${skill.name}</h4>
                <p>${skill.description}</p>
                ${levelInfo}
                ${buyButtonHTML}
            `;
            skillsListDiv.appendChild(itemDiv);
        });
    }

    /** Updates the Reviews tab with the latest customer reviews. */
    function updateReviewsTab() {
        if (!reviewsListDiv) { console.error("DOM Element: reviewsListDiv not found!"); return; }
        removeLoadingMessage(reviewsListDiv);
        reviewsListDiv.innerHTML = '';

        if (displayedReviews.length === 0) {
            reviewsListDiv.innerHTML = '<p class="loading-message">No customer reviews yet. Serve some drinks!</p>';
            return;
        }
        displayedReviews.slice().reverse().forEach(reviewText => { // Newest first
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('list-item');
            itemDiv.innerHTML = `<p>${reviewText}</p>`; // CSS now handles quote styling
            reviewsListDiv.appendChild(itemDiv);
        });
    }

    /** Helper function to call all individual tab update functions. */
    function updateAllDynamicTabs() {
        updateRecipePamphlet();
        updateUnlocksTab();
        updateUpgradesTab();
        updateSkillsTab();
        updateReviewsTab();
        // updateCustomerQueueDisplay(); // This will be called by functions that affect the queue
    }

    // --- End of Block 4 ---
    // ==================================================
    // BLOCK 5: INGREDIENT HANDLING & DRAG-AND-DROP
    // ==================================================

    /**
     * Updates the ingredient buttons/draggables in the middle panel.
     * Only shows unlocked ingredients and makes them draggable.
     */
    function updateIngredientButtons() {
        if (!ingredientsContainer) {
            console.error("DOM Element: ingredientsContainer not found!");
            return;
        }
        removeLoadingMessage(ingredientsContainer); // From Block 4
        ingredientsContainer.innerHTML = ''; // Clear existing buttons

        const unlockedIngredients = allIngredients.filter(ing => ing.unlocked);

        if (unlockedIngredients.length === 0) {
            ingredientsContainer.innerHTML = '<p class="loading-message">No ingredients unlocked yet! Check the Unlocks tab.</p>';
            return;
        }

        unlockedIngredients.forEach(ingredient => {
            const ingredientDiv = document.createElement('div');
            ingredientDiv.classList.add('ingredient-drag');
            ingredientDiv.textContent = ingredient.name;
            ingredientDiv.title = ingredient.name; // Tooltip for full name

            ingredientDiv.style.setProperty('--ingredient-color', ingredient.color || 'var(--neon-cyan)');
            ingredientDiv.draggable = true;
            ingredientDiv.dataset.ingredientId = ingredient.id;

            ingredientDiv.addEventListener('dragstart', (event) => handleDragStart(event, ingredient.id));
            ingredientDiv.addEventListener('dragend', handleDragEnd);

            ingredientsContainer.appendChild(ingredientDiv);
        });
    }

    /**
     * Handles the start of dragging an ingredient.
     * Sets data transfer and visual feedback. Includes pre-drag checks.
     * @param {DragEvent} event - The drag event.
     * @param {string} ingredientId - The ID of the ingredient being dragged.
     */
    function handleDragStart(event, ingredientId) {
        if (!isBarOpen || !gameActive) { // Pre-condition for dragging
            event.preventDefault();
            return;
        }

        const currentTotalIngredients = selectedIngredients.reduce((sum, item) => sum + item.count, 0);
        const existingItem = selectedIngredients.find(item => item.id === ingredientId);

        // Prevent dragging 'ice' if it's already in the mix
        if (ingredientId === 'ice' && existingItem) {
             showMessage("Ice already added to the mix.", "var(--neon-blue)");
             event.preventDefault(); // Stop the drag
             return;
        }
        // Prevent dragging a *new* item if the mixer is full.
        if (currentTotalIngredients >= MAX_INGREDIENTS_IN_MIXER && !existingItem) {
            showMessage("Mixing station is full!", "var(--neon-pink)");
            event.preventDefault(); // Stop the drag
            return;
        }
         // If mixer is full, but item being dragged is already in mix (and not ice), allow starting drag.
         // The handleDrop will ultimately decide if its count can be incremented.

        event.dataTransfer.setData("text/plain", ingredientId);
        event.dataTransfer.effectAllowed = "copy";
        currentlyDragging = { element: event.target, id: ingredientId };

        // Apply visual feedback with a timeout to ensure it's visible before drag ghost image is taken by browser
        setTimeout(() => {
            if(currentlyDragging && event.target === currentlyDragging.element){ // Check if this is still the item being dragged
                event.target.style.opacity = '0.5';
                event.target.style.transform = 'scale(1.05)'; // Slight visual cue for dragging
            }
        }, 0);
    }

    /** Handles the end of dragging an ingredient (successful drop or cancelled). Cleans up styles. */
    function handleDragEnd(event) {
        // Restore styles of the dragged element, if it was the one we tracked
        if (currentlyDragging && event.target === currentlyDragging.element) {
            currentlyDragging.element.style.opacity = '1';
            currentlyDragging.element.style.transform = 'scale(1)';
        }
        currentlyDragging = null; // Clear the globally tracked dragging item

        // Always remove 'drag-over' class from the mixing station on drag end
        if (mixingStation) {
            mixingStation.classList.remove('drag-over');
        }
    }

    /** Prevents default handling to allow dropping over the mixing station and adds highlight. */
    function handleDragOver(event) {
        if (currentlyDragging && isBarOpen && gameActive) {
            event.preventDefault(); // This is crucial to allow a drop event
            event.dataTransfer.dropEffect = "copy"; // Show a copy cursor
            if (mixingStation && !mixingStation.classList.contains('drag-over')) {
                mixingStation.classList.add('drag-over'); // Highlight the drop zone
            }
        } else {
            event.dataTransfer.dropEffect = "none"; // Indicate drop is not allowed
        }
    }

    /** Removes highlight effect when dragging leaves the drop zone. */
    function handleDragLeave(event) {
         // Remove highlight only if leaving the mixing station container itself,
         // not when moving over its child elements (like ingredients already in it).
         if (mixingStation && (!event.relatedTarget || !mixingStation.contains(event.relatedTarget))) {
             mixingStation.classList.remove('drag-over');
         }
    }

    /** Handles dropping an ingredient onto the mixing station. */
    function handleDrop(event) {
        event.preventDefault(); // Prevent default browser action (e.g., opening file)
        if (mixingStation) mixingStation.classList.remove('drag-over'); // Always remove highlight

        if (!isBarOpen || !gameActive || !currentlyDragging) return; // Drop not allowed

        const ingredientId = event.dataTransfer.getData("text/plain");
        if (!ingredientId) { console.warn("Drop event without ingredient ID."); return; }

        const currentTotalIngredients = selectedIngredients.reduce((sum, item) => sum + item.count, 0);
        const existingItem = selectedIngredients.find(item => item.id === ingredientId);

        // Check capacity and duplicate ice again on drop, as conditions might have changed or for direct drops
        if (ingredientId === 'ice' && existingItem) { // Ice already exists, can't add more
            showMessage("Ice is already in the mix.", "var(--neon-blue)");
            return; // Don't add, don't change anything
        }
        // If mixer is full AND (it's a new type of item OR it's ice which can't have its count incremented)
        if (currentTotalIngredients >= MAX_INGREDIENTS_IN_MIXER && (!existingItem || ingredientId === 'ice')) {
            showMessage("Mixing station is full!", "var(--neon-pink)");
            return;
        }

        // Add ingredient to selectedIngredients state
        if (ingredientId === 'ice') { // Ice does not stack its own count; only one instance allowed
            if (!existingItem) { // Only add if ice isn't already there
                selectedIngredients.push({ id: ingredientId, count: 1 });
            } else { return; } // Should have been caught by pre-drag, but defensive
        } else { // Other ingredients can stack
            if (existingItem) {
                existingItem.count++;
            } else { // New stackable item and there's space
                selectedIngredients.push({ id: ingredientId, count: 1 });
            }
        }

        isShaken = false; // Adding/changing an ingredient resets shaken status
        if (mixerImageVisual) { // The element that shows the mixer graphic
             mixerImageVisual.classList.remove('mixing-gentle', 'mixing-shake'); // Clear any shake animation
        }
        updateMixingArea(); // Updates #mixed-ingredients-display and button states (from Block 3)
    }

    /** Sets up the main drop zone event listeners for the mixing station. */
    function setupDragAndDropListeners() {
        if (mixingStation) { // The parent div is the drop target area
            mixingStation.addEventListener('dragover', handleDragOver);
            mixingStation.addEventListener('dragleave', handleDragLeave);
            mixingStation.addEventListener('drop', handleDrop);
        } else {
            console.error("DOM Element: mixingStation not found for D&D setup!");
        }
    }

    // --- End of Block 5 ---
    // =========================================
    // BLOCK 6: GAME CLOCK AND TIMING FUNCTIONS
    // =========================================

    /** Advances the game time by MINUTE_INCREMENT and checks for closing time. */
    function advanceTime() {
        if (!gameActive || !isBarOpen) return; // Only advance if game is active and bar is open

        gameMinute += MINUTE_INCREMENT; // MINUTE_INCREMENT is 1 (from Block 1)
        if (gameMinute >= 60) {
            gameMinute = 0;
            gameHour++;
        }

        // Check if bar should close based on time
        if (gameHour >= BAR_CLOSE_HOUR) {
            endDay(); // Trigger end-of-day sequence
            return; // Stop further processing for this tick if day ended
        }
        updateClockDisplay(); // Update visual clock (from Block 3)
    }

    /** Starts the main game clock interval and initiates customer spawning checks. */
    function startGameClock() {
        if (gameClockInterval) return; // Prevent multiple clock intervals
        console.log("Game clock started.");
        // gameActive and isBarOpen states are expected to be true when this is called.

        gameClockInterval = setInterval(() => {
            if (!gameActive || !isBarOpen) { // Double-check state on each tick
                stopGameClock(); // If game state changes unexpectedly, stop the clock.
                return;
            }
            advanceTime();

            // Customer spawning logic check
            if (!currentCustomer && !customerSpawnTimeout) { // Only if no current customer and no spawn check already pending
                 scheduleNextSpawnAttempt(SPAWN_CHECK_DELAY); // scheduleNextSpawnAttempt is defined in Block 7
            }
        }, GAME_TICK_INTERVAL); // Ticks every second
    }

    /** Stops the main game clock interval and any pending customer spawn attempts. */
    function stopGameClock() {
        if (gameClockInterval) {
            console.log("Game clock stopped.");
            clearInterval(gameClockInterval);
            gameClockInterval = null;
        }
        stopCustomerSpawning(); // Defined in Block 7, ensures no new spawn attempts are scheduled
    }

    /** Starts the timer for the current customer order. */
    function startOrderTimer() {
        stopOrderTimer(); // Clear any existing timer first
        if (!currentCustomer) return;

        let timeBonus = 0;
        if (barUpgrades.entertainment && barUpgrades.entertainment.currentLevel > 0) {
            const levelIndex = barUpgrades.entertainment.currentLevel - 1;
            if (barUpgrades.entertainment.levels[levelIndex]) { // Check level data exists
                 timeBonus = barUpgrades.entertainment.levels[levelIndex].timeBonus;
            }
        }
        currentOrderTimeLimit = BASE_ORDER_TIME_LIMIT + timeBonus;
        remainingOrderTime = currentOrderTimeLimit;

        if (timerDisplay) {
             timerDisplay.textContent = `Order Time: ${remainingOrderTime}s`;
             timerDisplay.style.color = 'var(--neon-orange)'; // Reset color
             timerDisplay.style.textShadow = 'var(--text-glow-orange)';
        }

        orderTimerInterval = setInterval(() => {
            remainingOrderTime--;
            if (timerDisplay) {
                timerDisplay.textContent = `Order Time: ${remainingOrderTime}s`;
                // Visual feedback for low time
                if (remainingOrderTime <= 5 && remainingOrderTime > 0) {
                    timerDisplay.style.color = 'red';
                    timerDisplay.style.textShadow = '0 0 5px red';
                } else if (remainingOrderTime > 5) { // Reset to normal if time increases or is not low
                     timerDisplay.style.color = 'var(--neon-orange)';
                     timerDisplay.style.textShadow = 'var(--text-glow-orange)';
                }
            }
            if (remainingOrderTime <= 0) {
                handleTimeout(); // Handle timeout when timer reaches 0
            }
        }, 1000); // Decrement every second
    }

    /** Stops the current order timer and resets its display. */
    function stopOrderTimer() {
        if (orderTimerInterval) {
            clearInterval(orderTimerInterval);
            orderTimerInterval = null;
        }
        if (timerDisplay) { // Always reset display text when timer stops
            timerDisplay.textContent = `Order Time: --`;
            timerDisplay.style.color = 'var(--neon-orange)'; // Reset color
            timerDisplay.style.textShadow = 'var(--text-glow-orange)';
        }
    }

    /** Handles the customer leaving due to timeout. */
    function handleTimeout() {
        if (!currentCustomer) return; // Safety check

        stopOrderTimer(); // Ensure timer is stopped
        const customerName = currentCustomer.name;
        const wasVip = currentCustomer.isVip;
        const leavingCustomer = { ...currentCustomer }; // Clone for review, as currentCustomer is nulled next
        currentCustomer = null; // Clear current customer state

        showMessage(`${customerName} got impatient and left!`, "var(--neon-pink)");
        triggerCustomerEmotion('angry', true); // Show temporary angry emotion (from Block 3)
        addReview('timeout', leavingCustomer); // addReview is defined in Block 8

        if (wasVip) {
            money -= VIP_TIMEOUT_PENALTY;
            console.log(`VIP timeout penalty: -$${VIP_TIMEOUT_PENALTY}`);
            updateStaticUIDisplays(); // Update money display immediately (from Block 3)
        }
        
        // Clear any existing timeout for clearing display, then set a new one
if (clearCustomerDisplayTimeoutId) clearTimeout(clearCustomerDisplayTimeoutId);
clearCustomerDisplayTimeoutId = setTimeout(clearCustomerDisplay, CUSTOMER_CLEAR_DELAY); 


        // QUEUE LOGIC: Try to serve next from queue first
        if (!serveNextCustomerFromQueue()) { // serveNextCustomerFromQueue is from Block 7, returns true if successful
            // If queue was empty and no one was served, then try to schedule a new spawn
            if (isBarOpen && gameActive) {
                scheduleNextSpawnAttempt(POST_EVENT_SPAWN_DELAY); // From Block 7
            }
        }
        setTimeout(clearCustomerDisplay, CUSTOMER_CLEAR_DELAY); // Clear visuals after a delay (from Block 3)
        updatePatronInteractionScreen(); // Update social UI as current customer changed (from Block 10)
    }

    /** Handles the end of the day sequence. */
    function endDay() {
        // Prevent re-triggering if already in setup phase from THIS day's end sequence
        if (isSetupPhase && !isBarOpen && !gameActive && currentDay > 1 && gameHour === BAR_OPEN_HOUR && gameMinute === 0) {
            console.log("EndDay: Already in setup phase for next day or called inappropriately.");
            return;
        }
        
        console.log("Bar Closing for the Day!");
        isBarOpen = false;  // Set bar to closed
        gameActive = false; // Stop main game activities

        stopGameClock();    // Stops main clock and any pending customer spawns
        stopOrderTimer();   // Stops current order timer if any customer was active

        if (currentCustomer) { // If a customer was present when bar closed
            showMessage(`Closing time! ${currentCustomer.name} heads home.`, "var(--neon-blue)");
            currentCustomer = null;
            clearCustomerDisplay(); // Clear customer visuals immediately (from Block 3)
        } else {
            showMessage("Bar closed for the day!", "var(--neon-blue)");
            // Ensure customer area is clear even if no customer was present.
            if(customerIcon && customerIcon.src !== "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"){
                clearCustomerDisplay();
            }
        }
        
        // Clear the data and visual customer queue
        customerQueue = []; 
        updateCustomerQueueDisplay(); // From Block 10 (or where it will be defined)
        updatePatronInteractionScreen(); // From Block 10 (or where it will be defined) - Clear patrons from social UI

        // Worker daily cost deduction
        if (hiredWorker) {
            let costToPay = Math.floor(Math.random() * (WORKER_DAILY_COST_MAX - WORKER_DAILY_COST_MIN + 1)) + WORKER_DAILY_COST_MIN;
            money -= costToPay;
            console.log(`Paid worker $${costToPay}. Remaining money: $${money}`);
            // A day-end summary could show this. For now, relies on money display being updated.
            updateStaticUIDisplays(); // Update money display (from Block 3)
        }

        // Update Open/Close sign
        if (openCloseSign) {
             openCloseSign.textContent = "CLOSED";
             openCloseSign.classList.remove("open");
             openCloseSign.classList.add("closed");
             openCloseSign.disabled = true; // Disabled until next day's setup phase
        }

        // Disable action buttons and clear the mixer
        if(clearBtn) clearBtn.disabled = true;
        if(shakeBtn) shakeBtn.disabled = true;
        if(serveBtn) serveBtn.disabled = true;
        clearMix(); // Clears ingredients and stops mixer animation (from Block 3)

        // Stop game music
        stopMusic(gameMusicPlayer); // stopMusic is in Block 10
        console.log("Game music stopped for end of day.");
        if (activeMusicPlayer === gameMusicPlayer) activeMusicPlayer = null;


        // Transition to setup phase for the next day
        setTimeout(() => {
            isSetupPhase = true; // Enter setup phase
            currentDay++;
            gameHour = BAR_OPEN_HOUR; // Reset time for next day
            gameMinute = 0;
            updateClockDisplay(); // From Block 3

            showMessage(`End of Day ${currentDay-1}. Press SETUP to begin Day ${currentDay}.`, "var(--neon-cyan)");

            if (openCloseSign) {
                 openCloseSign.textContent = "SETUP";
                 openCloseSign.disabled = false; // Enable setup button
                 openCloseSign.classList.remove("open"); // Ensure correct style for setup phase
                 openCloseSign.classList.add("closed");
            }
        }, END_DAY_TRANSITION_DELAY);
    }

    // --- End of Block 6 ---
    // ==================================
    // BLOCK 7: CUSTOMER SPAWNING & QUEUE LOGIC
    // ==================================

    /**
     * Generates data for a new potential customer.
     * Order is assigned later when they become the active 'currentCustomer'.
     * @returns {object | null} A customer object with name, icon, VIP status, unique ID, or null.
     */
    function generatePotentialCustomer() {
        if (customerNames.length === 0 || customerIconUrls.length === 0) {
            console.warn("Cannot generate customer: Missing customerNames or customerIconUrls arrays.");
            return null;
        }
        const nameIndex = Math.floor(Math.random() * customerNames.length);
        const iconIndex = Math.floor(Math.random() * customerIconUrls.length);
        const isVipCustomer = Math.random() < VIP_CHANCE;

        return {
            id: `cust_${Date.now()}_${Math.floor(Math.random() * 10000)}`, // Basic unique ID
            name: customerNames[nameIndex % customerNames.length] + (isVipCustomer ? " (VIP)" : ""),
            isVip: isVipCustomer,
            iconUrl: customerIconUrls[iconIndex % customerIconUrls.length],
            order: null // Order will be assigned when they become the currentCustomer
            // TODO: Could add 'thoughts' or 'dialogueKeys' here from patronDialogues for Social UI later
        };
    }

    /**
     * Adds a newly generated customer to the waiting queue if there's space.
     * Calls for UI update of the queue.
     * @returns {boolean} True if customer was successfully added to queue, false otherwise.
     */
    function addCustomerToQueue() {
        if (customerQueue.length >= MAX_CUSTOMERS_IN_QUEUE) {
            showMessage("The queue is full... another potential customer decided not to wait.", "var(--neon-orange)");
            return false; // Queue is full
        }
        const potentialCustomer = generatePotentialCustomer();
        if (potentialCustomer) {
            customerQueue.push(potentialCustomer);
            console.log(`${potentialCustomer.name} added to queue. Queue: ${customerQueue.length}/${MAX_CUSTOMERS_IN_QUEUE}`);
            updateCustomerQueueDisplay(); // Defined in Block 10 - updates the visual queue
            updatePatronInteractionScreen(); // Defined in Block 10 - refreshes Social UI
            return true;
        }
        return false; // Failed to generate customer
    }

    /**
     * Takes the next customer from queue, makes them active, assigns order.
     * Called when currentCustomer leaves and queue is not empty.
     * @returns {boolean} True if a customer was served from queue, false otherwise.
     */
    function serveNextCustomerFromQueue() {
        if (customerQueue.length > 0) {
            const nextCustomerData = customerQueue.shift(); // Get and remove first customer
            console.log(`Serving next customer from queue: ${nextCustomerData.name}`);
            updateCustomerQueueDisplay(); // Update visual queue immediately after removing
            spawnNewCustomer(nextCustomerData); // Make this customer active and assign order
            return true; // Successfully processed a customer from queue
        }
        // console.log("serveNextCustomerFromQueue called, but queue is empty.");
        return false; // Queue was empty
    }

    /**
     * Schedules the next attempt to spawn a customer (either to bar or queue).
     * @param {number} [delay=GAME_TICK_INTERVAL] - Delay in milliseconds.
     */
    function scheduleNextSpawnAttempt(delay = GAME_TICK_INTERVAL) {
        if (customerSpawnTimeout) clearTimeout(customerSpawnTimeout);
        
        if (!isBarOpen || !gameActive) { // Core condition: bar must be open and game active
            customerSpawnTimeout = null;
            return;
        }
        // If bar is full (current customer + full queue), delay spawn checks further
        if (currentCustomer && customerQueue.length >= MAX_CUSTOMERS_IN_QUEUE) {
            console.log("Bar and queue are full. Holding off new customer arrivals temporarily.");
            customerSpawnTimeout = setTimeout(attemptCustomerSpawn, delay * 2); // Check less frequently
            return;
        }
        customerSpawnTimeout = setTimeout(attemptCustomerSpawn, delay);
    }

    /** Stops any pending customer spawn attempts by clearing the timeout. */
    function stopCustomerSpawning() {
        if (customerSpawnTimeout) {
            clearTimeout(customerSpawnTimeout);
            customerSpawnTimeout = null;
        }
    }

    /**
     * Attempts to generate a new customer. If bar is free, they become current.
     * If bar is busy, they try to join the queue.
     */
    function attemptCustomerSpawn() {
        if (!isBarOpen || !gameActive) {
            customerSpawnTimeout = null; return;
        }
        // If bar and queue are already at max capacity, don't even try to generate
        if (currentCustomer && customerQueue.length >= MAX_CUSTOMERS_IN_QUEUE) {
            scheduleNextSpawnAttempt(GAME_TICK_INTERVAL * 2); // Check again later
            return;
        }

        if (Math.random() < BASE_CUSTOMER_SPAWN_RATE) {
            if (!currentCustomer) { // If bar spot is free
                console.log("Attempting to spawn new customer directly to bar.");
                spawnNewCustomer(); // Generate a new customer directly for the bar
            } else if (customerQueue.length < MAX_CUSTOMERS_IN_QUEUE) { // Bar is busy, but queue has space
                console.log("Bar is busy, attempting to add customer to queue.");
                addCustomerToQueue();
            } else {
                // Bar is busy and queue is full. Customer effectively doesn't arrive.
                console.log("Customer arrived, but bar and queue were full. They left.");
            }
        }
        // Always reschedule the next attempt, unless stopCustomerSpawning is called by spawnNewCustomer
        // or if the game ends/bar closes.
        if (gameActive && isBarOpen && !currentCustomer) { // If spot is still free and game is on
             scheduleNextSpawnAttempt();
        } else if (gameActive && isBarOpen && currentCustomer && customerQueue.length < MAX_CUSTOMERS_IN_QUEUE){ // If spot taken but queue has space
             scheduleNextSpawnAttempt();
        }
    }

    /**
     * Makes a customer active at the bar: assigns an order, updates UI.
     * If no customerData is passed (e.g. first customer of day), generates a new one.
     * @param {object|null} [customerDataToSpawn=null] - Pre-existing customer data (e.g., from queue).
     */
    function spawnNewCustomer(customerDataToSpawn = null) {
        // If trying to spawn a *new random* customer while bar spot is busy, try queueing them instead.
          // <<< NEW: Cancel any pending clear display timeout for the PREVIOUS customer >>>
        if (clearCustomerDisplayTimeoutId) {
              clearTimeout(clearCustomerDisplayTimeoutId);
              clearCustomerDisplayTimeoutId = null;
              console.log("Cancelled pending clearCustomerDisplay for new customer spawn.");
        }
    // <<< END OF NEW PART >>>
        if (currentCustomer && !customerDataToSpawn) {
            console.warn("spawnNewCustomer called for new random while currentCustomer exists. Attempting to queue.");
            addCustomerToQueue();
            return; 
        }

        let potentialCustomer = customerDataToSpawn; 
        if (!potentialCustomer) { // If no data passed (new spawn, not from queue)
            potentialCustomer = generatePotentialCustomer();
            if (!potentialCustomer) { 
                console.error("Failed to generate a new potential customer during spawnNewCustomer.");
                if(isBarOpen && gameActive) scheduleNextSpawnAttempt(GAME_TICK_INTERVAL * 2);
                return;
            }
        }

        // Filter for makeable drinks for THIS customer
        const makeableDrinks = allDrinks.filter(drink => {
            if (!drink.unlocked) return false;
            // AGING FEATURE: Check if aging rack is required and if the player has it
            if (drink.needsAging && (!barUpgrades.aging_rack || barUpgrades.aging_rack.currentLevel === 0)) {
                return false; 
            }
            if (!drink.recipe.every(recipeIng => allIngredients.find(i => i.id === recipeIng.id)?.unlocked)) return false;
            if (drink.requires && drink.requires.length > 0) {
                if (!drink.requires.every(reqId => allIngredients.find(i => i.id === reqId)?.unlocked)) return false;
            }
            return true; 
        });

        if (makeableDrinks.length === 0) {
            console.warn(`No makeable drinks for ${potentialCustomer.name}. They might leave or be re-queued.`);
            showMessage(`${potentialCustomer.name} scanned the menu... "Nothing I fancy today," they mutter, walking out.`, "var(--neon-orange)");
            // If this customer came from queue, they are now gone.
            // Try to serve next from queue or schedule new spawn.
            if (!serveNextCustomerFromQueue()) { 
                if(isBarOpen && gameActive) scheduleNextSpawnAttempt(POST_EVENT_SPAWN_DELAY);
            }
            return;
        }

        currentCustomer = potentialCustomer; // This is now the active customer
        currentCustomer.order = makeableDrinks[Math.floor(Math.random() * makeableDrinks.length)]; // Assign an order

        // Update UI for the new currentCustomer
        if (customerIcon) {
            customerIcon.src = currentCustomer.iconUrl;
            customerIcon.alt = currentCustomer.name;
            customerIcon.classList.toggle('vip', currentCustomer.isVip);
            customerIcon.classList.remove('happy', 'angry');
            customerIcon.style.animation = 'none'; 
        }
        if (emotionPopup) emotionPopup.classList.remove('visible', 'happy', 'angry');
        if (chatBubble) {
            chatBubble.textContent = `"${currentCustomer.order.name}, please!"`;
            const cbColor = currentCustomer.isVip ? 'var(--vip-color)' : 'var(--neon-green)';
            const cbGlow = currentCustomer.isVip ? 'var(--vip-glow)' : 'var(--text-glow-green)';
            chatBubble.style.borderColor = cbColor; chatBubble.style.color = cbColor;
            chatBubble.style.textShadow = cbGlow;
            chatBubble.style.setProperty('--chat-bubble-border-color', cbColor);
        }

        showMessage(`${currentCustomer.name} steps up to the bar. Order: ${currentCustomer.order.name}${currentCustomer.order.needsAging ? ' (Needs Aging!)' : ''}`, "var(--neon-cyan)");
        startOrderTimer();        // From Block 6
        clearMix();               // From Block 3
        if (serveBtn) serveBtn.disabled = false; // Enable the serve button
        updateMixingArea();       // From Block 3
        updatePatronInteractionScreen(); // From Block 10 - refresh Social UI

        stopCustomerSpawning(); // A customer is now active at the bar, so pause further automatic spawn attempts
    }

    // --- End of Block 7 ---
    // ==================================
    // BLOCK 8: DRINK MAKING FUNCTIONS
    // ==================================

    /**
     * Compares the player's current mix with the customer's order recipe.
     * Assumes 'currentCustomer' and its 'order' are valid when called by serveDrink.
     * @returns {boolean} True if the mix matches the recipe exactly.
     */
    function compareRecipe() {
        // This check should be implicitly guaranteed by serveDrink which ensures currentCustomer.order exists
        const recipe = currentCustomer.order.recipe;
        const playerMix = selectedIngredients;

        // For an exact match, the number of unique ingredient types and their counts must match.
        // First, check if the number of distinct ingredients in the recipe matches the mix.
        if (recipe.length !== playerMix.length) {
            // console.log("Recipe Mismatch: Different number of distinct ingredient types.");
            return false;
        }

        // Create frequency maps for robust comparison, ignoring order of ingredients in playerMix
        const recipeMap = recipe.reduce((map, item) => { map[item.id] = (map[item.id] || 0) + item.count; return map; }, {});
        const playerMixMap = playerMix.reduce((map, item) => { map[item.id] = (map[item.id] || 0) + item.count; return map; }, {});

        // Check if all ingredients in recipeMap are in playerMixMap with same counts
        for (const id in recipeMap) {
            if (playerMixMap[id] !== recipeMap[id]) {
                // console.log(`Recipe Mismatch: Ingredient ${id} count. Expected ${recipeMap[id]}, got ${playerMixMap[id] || 0}`);
                return false;
            }
        }
        // Since recipe.length === playerMix.length, and all items in recipeMap match playerMixMap,
        // there cannot be extra ingredients in playerMixMap.
        return true;
    }

    /**
     * Adds a review to the displayed list and updates the tab.
     * @param {string} type - The category of review (e.g., 'goodServe', 'badServe', 'timeout').
     * @param {object | null} customerForReview - The customer object (used for name).
     */
    function addReview(type, customerForReview) {
        const pool = reviewPool[type] || [];
        if (pool.length === 0) {
             console.warn(`No review pool found for type: ${type}`);
             return;
        }
        let reviewText = pool[Math.floor(Math.random() * pool.length)];

        if (type === 'badServe' && reviewText.includes('[random ingredient]')) {
            const unlockedIngredientNames = allIngredients
                .filter(i => i.unlocked && i.id !== 'ice') // Exclude ice and locked items
                .map(i => i.name);
            const randomIngredient = unlockedIngredientNames.length > 0
                ? unlockedIngredientNames[Math.floor(Math.random() * unlockedIngredientNames.length)]
                : "that glowing stuff"; // Fallback if somehow no ingredients are available
            reviewText = reviewText.replace('[random ingredient]', randomIngredient);
        }

        const reviewerName = customerForReview?.name || 'A Glitched Patron'; // Use optional chaining for safety
        const finalReview = `${reviewerName}: ${reviewText}`;
        displayedReviews.unshift(finalReview); // Add to the beginning for newest first
        if (displayedReviews.length > MAX_REVIEWS_DISPLAYED) {
            displayedReviews.pop(); // Remove the oldest if exceeding max
        }
        updateReviewsTab(); // Defined in Block 4
    }

    /** Handles serving the drink to the customer. Checks recipe, shaking, and aging. */
    function serveDrink() {
        if (!isBarOpen || !currentCustomer || !currentCustomer.order) {
            // console.log("Serve conditions not met: Bar closed, no customer, or no order.");
            return;
        }
        if (selectedIngredients.length === 0) {
            showMessage("Can't serve an empty glass!", "var(--neon-pink)");
            return;
        }

        stopOrderTimer(); // Stop timer immediately (from Block 6)
        const order = currentCustomer.order;
        const customerLeaving = { ...currentCustomer }; // Clone for use after currentCustomer is nulled for feedback

        let serveSuccess = true;
        let feedbackMessage = "";
        let feedbackColor = "var(--neon-green)"; // Default success
        let reviewType = 'goodServe';
        let emotionType = 'happy';

        // --- Validation Checks (performed while currentCustomer is still valid for compareRecipe) ---
        // 1. AGING FEATURE: Check Aging Requirement
        if (order.needsAging && (!barUpgrades.aging_rack || barUpgrades.aging_rack.currentLevel === 0)) {
            serveSuccess = false;
            feedbackMessage = `This ${order.name} needs aging! You need the Chrono-Aging Rack.`;
            feedbackColor = "var(--neon-pink)";
            reviewType = 'badServe';
            emotionType = 'angry';
        }

        // 2. Shaking Requirement Check (only if previous checks passed)
        if (serveSuccess) {
            if (order.requiresShake && !isShaken) {
                serveSuccess = false;
                feedbackMessage = `The ${order.name} needed shaking! ${customerLeaving.name} isn't pleased.`;
                feedbackColor = "var(--neon-pink)";
                reviewType = 'badServe';
                emotionType = 'angry';
            } else if (!order.requiresShake && isShaken) {
                serveSuccess = false;
                feedbackMessage = `That ${order.name} didn't need shaking! ${customerLeaving.name} is confused.`;
                feedbackColor = "var(--neon-pink)";
                reviewType = 'badServe';
                emotionType = 'angry'; // Or a 'confused' emotion/review type if desired
            }
        }

        // 3. Ingredient Recipe Check (only if previous checks passed)
        if (serveSuccess) {
            // currentCustomer is still valid here for compareRecipe to use its order
            const ingredientsCorrect = compareRecipe();
            if (!ingredientsCorrect) {
                serveSuccess = false;
                feedbackMessage = `Whoops! That's not a ${order.name}. Check the recipe.`;
                feedbackColor = "var(--neon-pink)";
                reviewType = 'badServe';
                emotionType = 'angry';
            }
        }

        // Nullify customer state *after* all checks requiring currentCustomer.order are done
        currentCustomer = null;

        // --- Determine Outcome & Give Feedback ---
        if (serveSuccess) {
            // --- Success Case ---
            score++;
            let basePrice = order.price;
            let tipBonus = (barUpgrades.seating && barUpgrades.seating.currentLevel > 0) ? barUpgrades.seating.levels[barUpgrades.seating.currentLevel - 1].tipBonus : 0;
            let efficiencyMultiplier = (bartenderSkills.efficiency && bartenderSkills.efficiency.currentLevel > 0) ? bartenderSkills.efficiency.levels[bartenderSkills.efficiency.currentLevel - 1].moneyMultiplier : 1.0;
            let vipMultiplier = customerLeaving.isVip ? VIP_MONEY_MULTIPLIER : 1.0;
            // <<< NEW FEATURE: Apply worker bonus if a worker is hired >>>
            let workerBonus = hiredWorker ? WORKER_MONEY_MULTIPLIER : 1.0;

            let earned = Math.ceil((basePrice + tipBonus) * efficiencyMultiplier * vipMultiplier * workerBonus);
            money += earned;
            feedbackMessage = `Perfect! ${order.name} served to ${customerLeaving.name}! +$${earned}`;
            // feedbackColor, reviewType, emotionType remain at their default success values
            updateStaticUIDisplays(); // Update score, money displays immediately (from Block 3)
        }
        // else: Failure feedback variables (feedbackMessage, color, reviewType, emotionType) were already set.

        showMessage(feedbackMessage, feedbackColor); // From Block 3
        triggerCustomerEmotion(emotionType, !serveSuccess); // From Block 3 (Persistent happy if success, temporary if fail)
        addReview(reviewType, customerLeaving); // Adds review and updates tab

        if (clearCustomerDisplayTimeoutId) clearTimeout(clearCustomerDisplayTimeoutId);
        clearCustomerDisplayTimeoutId = setTimeout(clearCustomerDisplay, CUSTOMER_CLEAR_DELAY);
        clearMix(); // Always clear the mix after serving (success or fail) (From Block 3)
        if(serveBtn) serveBtn.disabled = true; // Disable serve button until next customer arrives

        // <<< QUEUE LOGIC: Attempt to serve next from queue, or schedule new spawn >>>
        if (!serveNextCustomerFromQueue()) { // serveNextCustomerFromQueue is in Block 7, returns true if successful
            // If queue was empty and no one was served from it, then try to spawn a new one
            if (isBarOpen && gameActive) {
                scheduleNextSpawnAttempt(POST_EVENT_SPAWN_DELAY); // From Block 7
            }
        }
        updatePatronInteractionScreen(); // From Block 10 - to update social UI list
    }


    /** Handles the shake button click. Applies animation to mixer image. */
    function shakeDrink() {
        // MODIFIED: Applies animation to mixerImageVisual
        if (!isBarOpen || !gameActive || selectedIngredients.length === 0 || isShaken) {
            if (isShaken && selectedIngredients.length > 0) {
                 showMessage("Already shaken!", "var(--neon-blue)");
            } else if (selectedIngredients.length === 0 && isBarOpen) { // Only show "Nothing to shake" if bar is open
                 showMessage("Nothing to shake!", "var(--neon-pink)");
            }
            return;
        }

        const requiresShakeForOrder = currentCustomer?.order?.requiresShake; // Optional chaining for safety
        const animationClass = requiresShakeForOrder ? 'mixing-shake' : 'mixing-gentle';

        if (!mixerImageVisual) { // Check if the target element for animation exists
             console.error("DOM Element: mixerImageVisual not found for shaking!");
             return;
        }

        isShaken = true; // Set state: mix is now considered shaken
        showMessage("Shaking...", "var(--neon-orange)");

        // Apply animation class to the image visual element
        mixerImageVisual.classList.remove('mixing-gentle', 'mixing-shake'); // Clear previous anim
        void mixerImageVisual.offsetWidth; // Force reflow to help ensure animation restarts if same class
        mixerImageVisual.classList.add(animationClass);

        // Calculate shake time based on skill
        let shakeTimeReduction = (bartenderSkills.shaking && bartenderSkills.shaking.currentLevel > 0)
            ? bartenderSkills.shaking.levels[bartenderSkills.shaking.currentLevel - 1].shakeTimeReduction
            : 0;
        const finalShakeTime = Math.max(MIN_SHAKE_TIME, SHAKE_ANIMATION_BASE_TIME - shakeTimeReduction);

        // Disable buttons during animation to prevent conflicts
        if (shakeBtn) shakeBtn.disabled = true; // Disable shake while shaking
        if (clearBtn) clearBtn.disabled = true; // Prevent clearing while shaking
        if (serveBtn) serveBtn.disabled = true; // Prevent serving while shaking

        // After animation duration, remove class and re-evaluate button states
        setTimeout(() => {
            if (mixerImageVisual) {
                mixerImageVisual.classList.remove(animationClass); // Remove animation class from image
            }
            // Re-enable buttons based on current game state *after* shaking finishes
            // updateMixingArea handles button states based on isShaken, hasIngredients, isBarOpen etc.
            updateMixingArea(); // From Block 3 - This will correctly set shakeBtn disabled (isShaken=true), re-evaluate clearBtn, serveBtn

        }, finalShakeTime);
    }

    // --- End of Block 8 ---
    // ==================================================
    // BLOCK 9: PURCHASE HANDLING & TAB SWITCHING
    // ==================================================

    /**
     * Handles clicks on "Buy/Unlock/Upgrade" buttons within the tabs (event delegation target).
     * @param {Event} event - The click event object.
     */
    function handlePurchase(event) {
        const btn = event.target.closest('.buy-btn'); // Ensure we're acting on the button itself
        if (!btn || btn.disabled) return; // Exit if not a buy button or if button is already disabled

        const type = btn.dataset.type; // 'drink', 'ingredient', 'upgrade', 'skill'
        const id = btn.dataset.id;     // Name or key of the item

        if (!type || !id) {
            console.error("Purchase button missing data-type or data-id attributes:", btn);
            return;
        }

        let cost = 0;
        let purchased = false;
        let purchaseTarget = null; // Reference to the item being purchased/upgraded
        let successMessage = "";   // Message to show on successful purchase

        try { // Wrap purchase logic in try...catch for robustness
            switch (type) {
                case 'drink':
                    purchaseTarget = allDrinks.find(d => d.name === id);
                    if (purchaseTarget && !purchaseTarget.unlocked && purchaseTarget.cost > 0) {
                        cost = purchaseTarget.cost;
                        // Verify requirements again just before purchase
                        let canUnlock = true;
                        // Check if all ingredients for the recipe are unlocked
                        canUnlock = purchaseTarget.recipe.every(recIng => {
                            const ingredient = allIngredients.find(i => i.id === recIng.id);
                            return ingredient && ingredient.unlocked;
                        });
                        // Check any additional explicit 'requires' (e.g. base ingredients)
                        if (canUnlock && purchaseTarget.requires && purchaseTarget.requires.length > 0) {
                            canUnlock = purchaseTarget.requires.every(reqId => {
                                const reqIngredient = allIngredients.find(i => i.id === reqId);
                                return reqIngredient && reqIngredient.unlocked;
                            });
                        }

                        if (!canUnlock) {
                            showMessage("Cannot unlock recipe: Required ingredients are still locked!", 'var(--neon-pink)');
                            return; // Stop purchase
                        }

                        if (money >= cost) {
                            purchaseTarget.unlocked = true;
                            purchased = true;
                            successMessage = `Unlocked Recipe: ${purchaseTarget.name}!`;
                        } else {
                            showMessage(`Not enough cash! Need $${cost} to unlock ${purchaseTarget.name}.`, 'var(--neon-pink)');
                            return; // Stop purchase
                        }
                    }
                    break;

                case 'ingredient':
                    purchaseTarget = allIngredients.find(i => i.id === id);
                    if (purchaseTarget && !purchaseTarget.unlocked && purchaseTarget.cost > 0) {
                        cost = purchaseTarget.cost;
                        if (money >= cost) {
                            purchaseTarget.unlocked = true;
                            purchased = true;
                            successMessage = `Unlocked Ingredient: ${purchaseTarget.name}!`;
                        } else {
                            showMessage(`Not enough cash! Need $${cost} for ${purchaseTarget.name}.`, 'var(--neon-pink)');
                            return; // Stop purchase
                        }
                    }
                    break;

                case 'upgrade':
                    purchaseTarget = barUpgrades[id];
                    if (purchaseTarget && purchaseTarget.currentLevel < purchaseTarget.levels.length) {
                        cost = purchaseTarget.levels[purchaseTarget.currentLevel].cost;
                        if (money >= cost) {
                            purchaseTarget.currentLevel++;
                            purchased = true;
                            successMessage = `Upgraded ${purchaseTarget.name} to Level ${purchaseTarget.currentLevel}!`;
                            // AGING FEATURE: Special message for aging rack purchase
                            if (id === 'aging_rack' && purchaseTarget.currentLevel === 1) { // Assuming level 1 is the unlock
                                successMessage = `Purchased ${purchaseTarget.name}! You can now serve aged drinks.`;
                            }
                        } else {
                            showMessage(`Not enough cash! Need $${cost} for ${purchaseTarget.name} upgrade.`, 'var(--neon-pink)');
                            return; // Stop purchase
                        }
                    }
                    break;

                case 'skill':
                    purchaseTarget = bartenderSkills[id];
                    if (purchaseTarget && purchaseTarget.currentLevel < purchaseTarget.levels.length) {
                        cost = purchaseTarget.levels[purchaseTarget.currentLevel].cost;
                        if (money >= cost) {
                            purchaseTarget.currentLevel++;
                            purchased = true;
                            successMessage = `Improved ${purchaseTarget.name} to Level ${purchaseTarget.currentLevel}!`;
                        } else {
                            showMessage(`Not enough cash! Need $${cost} to improve ${purchaseTarget.name}.`, 'var(--neon-pink)');
                            return; // Stop purchase
                        }
                    }
                    break;
                default:
                    console.warn(`Unknown purchase type encountered: ${type}`);
                    return;
            }

            // --- Process successful purchase ---
            if (purchased) {
                money -= cost;
                showMessage(successMessage, 'var(--neon-green)');

                // Refresh relevant UI elements immediately after purchase
                updateStaticUIDisplays();   // Update money display & potentially skill/upgrade level summary
                updateAllDynamicTabs();     // Refresh all tabs (handles loading messages within)
                updateIngredientButtons();  // Refresh ingredient list if an ingredient was unlocked
            } else {
                // This path might be hit if the item was already maxed/unlocked and button wasn't properly disabled,
                // or if another logic error prevented the 'purchased' flag from being set.
                if (purchaseTarget) { // Check if purchaseTarget was found before accessing its properties
                    if ((type === 'upgrade' || type === 'skill') && purchaseTarget.currentLevel >= purchaseTarget.levels.length) {
                        showMessage("Item already at max level.", "var(--neon-blue)");
                    } else if ((type === 'drink' || type === 'ingredient') && purchaseTarget.unlocked) {
                        showMessage("Item already unlocked.", "var(--neon-blue)");
                    }
                }
                // console.warn(`Purchase action for ${type} - ${id} did not result in a purchase.`);
            }

        } catch (error) {
            console.error("Error during purchase processing:", error);
            showMessage("An error occurred during purchase. Check console.", 'red');
        }
    }

    /**
     * Sets the active tab in the right panel by toggling CSS classes.
     * @param {string} tabId - The data-tab value of the tab to activate (e.g., 'recipes').
     */
    function setActiveTab(tabId) {
        if (!tabButtons || !tabContents) {
             console.error("DOM Elements: tabButtons or tabContents not found for setActiveTab!");
             return;
        }

        // Update button states - add 'active' class to the clicked button, remove from others
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabId);
        });

        // Update content visibility - add 'active' class to the corresponding content, remove from others
        tabContents.forEach(content => {
            // Content ID is expected to match the pattern `${tabId}-content` from HTML
            const expectedContentId = `${tabId}-content`;
            content.classList.toggle('active', content.id === expectedContentId);
        });

        // Scroll the newly active content area to the top for better UX
        const activeContent = document.getElementById(`${tabId}-content`);
        if (activeContent) {
            activeContent.scrollTop = 0;
        }
        // Note: Content of tabs is generally refreshed by updateAllDynamicTabs() after a purchase
        // or at game start. If live refresh on every tab click is needed, specific update calls can be added here.
    }

    // --- End of Block 9 ---
    // =======================================================
    // BLOCK 10: UI MANAGEMENT, INITIALIZATION & CORE EVENT LISTENERS
    // =======================================================


function showScreen(screenElement) {
    if (!screenElement) {
        console.warn("showScreen: Attempted to show a null screen element.");
        return;
    }
    console.log(`--- Calling showScreen for: ${screenElement.id} ---`); // More prominent log

    // Hide all other major fullscreen UIs first
    [introSplashScreen, mainMenuScreen, gameUIWrapper, socialUIScreen, jukeboxUIScreen, tutorialModal, flashOverlay].forEach(el => {
        if (el && el !== screenElement && el.classList.contains('visible')) {
            console.log(`Hiding previously visible screen: ${el.id}`);
            el.classList.remove('visible');
        }
    });
    
    screenElement.classList.remove('hidden-initially');
    screenElement.classList.add('visible');
    
    // Manage body background based on the active screen
    if (screenElement === gameUIWrapper || screenElement === socialUIScreen || screenElement === jukeboxUIScreen) {
        console.log(`Attempting to ADD 'game-active-bg' to body for screen: ${screenElement.id}`);
        document.body.classList.add('game-active-bg');
        document.body.style.backgroundColor = ''; 
        console.log("Body classList after add:", ...document.body.classList); // Spread to see all classes
    } else {
        console.log(`Attempting to REMOVE 'game-active-bg' from body for screen: ${screenElement.id}`);
        document.body.classList.remove('game-active-bg');
        document.body.style.backgroundColor = '#000000'; 
        if(screenElement === mainMenuScreen) { 
             document.body.style.backgroundImage = 'none'; 
        }
        console.log("Body classList after remove:", ...document.body.classList);
    }
    console.log(`Finished showScreen for: ${screenElement.id}. It should be visible.`);
}

    function hideScreen(screenElement) {
        if (screenElement) {
            screenElement.classList.remove('visible');
            // The .fullscreen-ui base CSS (display:none when not .visible) should handle actual hiding
            console.log(`Hiding screen: ${screenElement.id}`);
        }
    }

    // --- Music Control Functions ---
    function fadeOutMusic(playerElement, callback) {
        if (!playerElement || playerElement.paused) {
            if(callback) callback();
            return;
        }
        console.log(`Fading out music for ${playerElement.id}`);
        let currentVolume = playerElement.volume;
        if (musicFadeInterval) clearInterval(musicFadeInterval); // Clear any existing fade

        musicFadeInterval = setInterval(() => {
            currentVolume -= MUSIC_FADE_STEP; // MUSIC_FADE_STEP = 0.1
            if (currentVolume <= 0) {
                playerElement.volume = 0;
                clearInterval(musicFadeInterval);
                musicFadeInterval = null;
                stopMusic(playerElement); // Fully stop and reset currentTime
                if (callback) callback();
            } else {
                playerElement.volume = Math.max(0, currentVolume); // Ensure volume doesn't go negative
            }
        }, MUSIC_FADE_INTERVAL); // MUSIC_FADE_INTERVAL = 50ms
    }

    function playMusicForContext(context) {
        console.log(`playMusicForContext called for: ${context}`);
        if (musicFadeInterval) { clearInterval(musicFadeInterval); musicFadeInterval = null; } // Stop any ongoing fade

        // Determine target player and stop the other one if it's different
        let playerToUse;
        let otherPlayer;
        if (context === 'menu') {
            playerToUse = menuMusicPlayer;
            otherPlayer = gameMusicPlayer;
        } else { // 'game' or 'jukebox' context
            playerToUse = gameMusicPlayer; // Jukebox controls the game music player
            otherPlayer = menuMusicPlayer;
        }

        if (activeMusicPlayer && activeMusicPlayer !== playerToUse && !activeMusicPlayer.paused) {
            stopMusic(activeMusicPlayer); // Stop currently active different player
        }
        if (otherPlayer && !otherPlayer.paused) {
             stopMusic(otherPlayer); // Ensure the other context's player is stopped
        }
        
        let playlistForContext;
        if (context === 'menu') {
            playlistForContext = playlist.filter(song => song.forMenu);
        } else if (context === 'game') {
            playlistForContext = playlist.filter(song => song.forGame);
        } else { // 'jukebox'
            // Jukebox can access all non-menu songs, or just game songs if preferred.
            // For simplicity, let's say jukebox plays from the game's usual playlist or all non-menu.
            playlistForContext = playlist.filter(song => !song.forMenu);
        }
        if (playlistForContext.length === 0) playlistForContext = [...playlist]; // Absolute fallback to all songs
        
        currentPlaylist = playlistForContext; // Update global for jukebox controls
        currentSongIndex = Math.floor(Math.random() * currentPlaylist.length); // Start with a random song

        if (playerToUse && currentPlaylist.length > 0 && currentPlaylist[currentSongIndex]) {
            const songToPlay = currentPlaylist[currentSongIndex];
            console.log(`Attempting to play for ${context}: ${songToPlay.title} on ${playerToUse.id}`);
            playerToUse.src = songToPlay.src;
            playerToUse.volume = 1; // Reset volume before playing
            playerToUse.play().then(() => {
                isMusicPlaying = true; activeMusicPlayer = playerToUse;
                updateJukeboxSongInfo();
                if (jukeboxPlayBtn && jukeboxPauseBtn && jukeboxUIScreen.classList.contains('visible') && playerToUse === gameMusicPlayer) {
                     jukeboxPlayBtn.style.display = 'none'; jukeboxPauseBtn.style.display = 'inline-block';
                }
            }).catch(error => {
                console.error(`Error playing ${context} music (${songToPlay.src}):`, error);
                isMusicPlaying = false; if(activeMusicPlayer === playerToUse) activeMusicPlayer = null;
                updateJukeboxSongInfo();
            });
        } else {
            console.warn(`No suitable music or player for context: ${context}.`);
            updateJukeboxSongInfo();
        }
    }

    function stopMusic(playerElement) {
        if (playerElement && !playerElement.paused) { playerElement.pause(); }
        if (playerElement) playerElement.currentTime = 0; 
        if (playerElement === activeMusicPlayer) { activeMusicPlayer = null; isMusicPlaying = false; }
        console.log(`Music stopped for player: ${playerElement?.id}`);
        updateJukeboxSongInfo();
        if (playerElement === gameMusicPlayer && jukeboxPlayBtn && jukeboxPauseBtn) {
            jukeboxPlayBtn.style.display = 'inline-block'; jukeboxPauseBtn.style.display = 'none';
        }
    }
    
    function toggleJukeboxPlayPause() {
        if (!gameMusicPlayer) return;
        if (gameMusicPlayer.paused) {
            if (!gameMusicPlayer.currentSrc || currentPlaylist.length === 0 || !currentPlaylist[currentSongIndex]) {
                // If jukebox was opened and no song context, try to play from its current list
                if (currentPlaylist.length > 0 && currentPlaylist[currentSongIndex]) {
                     gameMusicPlayer.src = currentPlaylist[currentSongIndex].src;
                } else {
                    playMusicForContext('jukebox'); // Try to init jukebox playlist
                    return; // playMusicForContext will handle play
                }
            }
            gameMusicPlayer.play().then(() => {
                isMusicPlaying = true; activeMusicPlayer = gameMusicPlayer;
                if(jukeboxPlayBtn) jukeboxPlayBtn.style.display = 'none';
                if(jukeboxPauseBtn) jukeboxPauseBtn.style.display = 'inline-block';
            }).catch(e => console.error("Jukebox play error:", e));
        } else {
            gameMusicPlayer.pause(); isMusicPlaying = false;
            if(jukeboxPlayBtn) jukeboxPlayBtn.style.display = 'inline-block';
            if(jukeboxPauseBtn) jukeboxPauseBtn.style.display = 'none';
        }
        updateJukeboxSongInfo();
    }

    function updateJukeboxSongInfo() {
        if (jukeboxSongInfo) {
            if (activeMusicPlayer === gameMusicPlayer && currentPlaylist.length > 0 && currentPlaylist[currentSongIndex]) {
                const song = currentPlaylist[currentSongIndex];
                const status = (isMusicPlaying && !gameMusicPlayer.paused) ? "Now Playing" : "Paused";
                jukeboxSongInfo.innerHTML = `${status}: <span>${song.title} - ${song.artist}</span>`;
            } else { jukeboxSongInfo.innerHTML = `<span>Jukebox Idle</span>`; }
        }
    }

    function playNextJukeboxSong() {
        if (currentPlaylist.length > 0) {
            currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
            if(!activeMusicPlayer || activeMusicPlayer !== gameMusicPlayer) activeMusicPlayer = gameMusicPlayer;
            activeMusicPlayer.src = currentPlaylist[currentSongIndex].src;
            activeMusicPlayer.play().then(() => {
                isMusicPlaying = true; updateJukeboxSongInfo();
                if(jukeboxPlayBtn) jukeboxPlayBtn.style.display = 'none';
                if(jukeboxPauseBtn) jukeboxPauseBtn.style.display = 'inline-block';
            }).catch(e=>console.error("Jukebox next error:", e));
        } else { showMessage("Jukebox playlist empty.", "var(--neon-orange)"); updateJukeboxSongInfo(); }
    }

    function playPrevJukeboxSong() {
        if (currentPlaylist.length > 0) {
            currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
            if(!activeMusicPlayer || activeMusicPlayer !== gameMusicPlayer) activeMusicPlayer = gameMusicPlayer;
            activeMusicPlayer.src = currentPlaylist[currentSongIndex].src;
            activeMusicPlayer.play().then(() => {
                isMusicPlaying = true; updateJukeboxSongInfo();
                if(jukeboxPlayBtn) jukeboxPlayBtn.style.display = 'none';
                if(jukeboxPauseBtn) jukeboxPauseBtn.style.display = 'inline-block';
            }).catch(e=>console.error("Jukebox prev error:", e));
        } else { showMessage("Jukebox playlist empty.", "var(--neon-orange)"); updateJukeboxSongInfo(); }
    }

    // --- Customer Queue & Patron UI Update Functions ---
    function updateCustomerQueueDisplay() {
        if (!queueList) { console.warn("DOM Element: queueList not found for update!"); return; }
        removeLoadingMessage(queueList); queueList.innerHTML = ''; 
        if (customerQueue.length === 0) {
            queueList.innerHTML = '<p class="loading-message">Queue is empty.</p>';
            return;
        }
        customerQueue.forEach(customer => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('queue-customer-item');
            itemDiv.dataset.customerId = customer.id; 
            if (customer.isVip) itemDiv.classList.add('vip');
            const iconImg = document.createElement('img');
            iconImg.classList.add('queue-customer-icon');
            iconImg.src = customer.iconUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            iconImg.alt = customer.name;
            const nameSpan = document.createElement('span');
            nameSpan.classList.add('queue-customer-name');
            nameSpan.textContent = customer.name;
            itemDiv.appendChild(iconImg); itemDiv.appendChild(nameSpan);
            queueList.appendChild(itemDiv);
        });
    }

    function updatePatronInteractionScreen() {
        if (!patronInteractionArea) { console.warn("DOM Element: patronInteractionArea not found!"); return; }
        removeLoadingMessage(patronInteractionArea); patronInteractionArea.innerHTML = '';
        const patronsToShow = [];
        if (currentCustomer) patronsToShow.push({...currentCustomer, status: "At the bar", internalId: currentCustomer.id});
        customerQueue.forEach((cq, index) => patronsToShow.push({...cq, status: `In queue #${index + 1}`, internalId: cq.id}));

        if (patronsToShow.length === 0) {
            patronInteractionArea.innerHTML = '<p class="loading-message">No patrons around to chat with.</p>'; return;
        }
        patronsToShow.forEach(patron => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('patron-social-item');
            itemDiv.dataset.patronId = patron.internalId; 
            const iconImg = document.createElement('img');
            iconImg.src = patron.iconUrl; iconImg.alt = patron.name; iconImg.classList.add('patron-social-icon');
            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('patron-social-details');
            const nameHeader = document.createElement('h4');
            nameHeader.textContent = patron.name + (patron.status ? ` (${patron.status})` : '');
            detailsDiv.appendChild(nameHeader);
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('patron-social-actions');
            const greetBtn = document.createElement('button');
            greetBtn.dataset.action = 'greet'; greetBtn.textContent = 'Say Hi';
            actionsDiv.appendChild(greetBtn);
            const askBtn = document.createElement('button');
            askBtn.dataset.action = 'askThoughts'; askBtn.textContent = 'Ask Thoughts';
            actionsDiv.appendChild(askBtn);
            
            const canBeOfferedJob = patron === currentCustomer && !patron.isVip; // Offer job only to current, non-VIP customer
            const offerJobAvailable = Math.random() < 0.33; // 33% chance for the option to appear
            if (!hiredWorker && canBeOfferedJob && offerJobAvailable) {
                const hireBtn = document.createElement('button');
                hireBtn.dataset.action = 'offerJob'; hireBtn.textContent = 'Offer Job?';
                actionsDiv.appendChild(hireBtn);
            } else if (hiredWorker && canBeOfferedJob) {
                const hiredMsg = document.createElement('p'); hiredMsg.textContent = "(Worker on staff)"; 
                hiredMsg.style.fontSize = "0.7em"; hiredMsg.style.opacity = "0.7";
                actionsDiv.appendChild(hiredMsg);
            }
            detailsDiv.appendChild(actionsDiv); itemDiv.appendChild(iconImg); itemDiv.appendChild(detailsDiv);
            patronInteractionArea.appendChild(itemDiv);
        });
    }
    
    function handlePatronInteraction(patronId, action) {
        let patron = (currentCustomer?.id === patronId) ? currentCustomer : customerQueue.find(p => p.id === patronId);
        if (!patron) { showMessage("That patron is no longer available.", "var(--neon-orange)"); return; }

        switch(action) {
            case 'greet':
                const greeting = patronDialogues.greet[Math.floor(Math.random() * patronDialogues.greet.length)];
                showMessage(`${patron.name.split(' (')[0]}: "${greeting}"`, "var(--neon-blue)");
                break;
            case 'askThoughts':
                const thought = patronDialogues.askThoughts[Math.floor(Math.random() * patronDialogues.askThoughts.length)];
                showMessage(`${patron.name.split(' (')[0]} says: "${thought}"`, "var(--neon-blue)");
                break;
            case 'offerJob': 
                 if (hiredWorker) { showMessage("You already have a worker!", "var(--neon-orange)"); return; }
                 if (patron !== currentCustomer || patron.isVip) { showMessage("Can't offer job to this patron now.", "var(--neon-orange)"); return; }
                 
                 showMessage(`You offer ${patron.name.split(' (')[0]} a job... They're thinking...`, "var(--neon-cyan)");
                 setTimeout(() => {
                     if (Math.random() < 0.66) { // 66% chance of accepting
                         hiredWorker = true;
                         dailyWorkerCost = Math.floor(Math.random() * (WORKER_DAILY_COST_MAX - WORKER_DAILY_COST_MIN + 1)) + WORKER_DAILY_COST_MIN;
                         const acceptMsg = patronDialogues.jobOfferAccept[Math.floor(Math.random() * patronDialogues.jobOfferAccept.length)];
                         showMessage(`${patron.name.split(' (')[0]} says: "${acceptMsg}" You hired a worker! Cost: $${dailyWorkerCost}/day. You now earn 2x cash!`, "var(--neon-green)");
                         updateStaticUIDisplays();
                         updatePatronInteractionScreen(); 
                     } else {
                         const declineReason = patronDialogues.jobOfferDecline[Math.floor(Math.random() * patronDialogues.jobOfferDecline.length)];
                         showMessage(`${patron.name.split(' (')[0]} declines: "${declineReason}"`, "var(--neon-orange)");
                     }
                 }, 1500 + Math.random() * 1000); 
                break;
            default:
                showMessage(`Interacted with ${patron.name} (${action})... (Define this interaction!)`, "var(--neon-blue)");
        }
    }

    // --- Core Game UI Event Handlers ---
    function toggleQueueDisplay() { 
        if (!queueSection || !queueToggleBtn) return;
        isQueueVisible = !isQueueVisible;
        queueSection.style.display = isQueueVisible ? 'block' : 'none';
        queueToggleBtn.textContent = isQueueVisible ? 'Queue <' : 'Queue >';
        queueToggleBtn.title = isQueueVisible ? 'Hide Customer Queue' : 'Show Customer Queue';
        if (isQueueVisible) updateCustomerQueueDisplay();
    }
    function handleTabButtonClick(event) { 
        const clickedButton = event.target.closest('.tab-btn');
        if (clickedButton && clickedButton.dataset.tab) setActiveTab(clickedButton.dataset.tab); 
    }
    function handleListButtonClick(event) { 
        const buyButton = event.target.closest('.buy-btn');
        const patronActionButton = event.target.closest('.patron-social-actions button'); 
        if (buyButton && !buyButton.disabled) handlePurchase(event); 
        else if (patronActionButton) {
            const action = patronActionButton.dataset.action;
            const patronItem = patronActionButton.closest('.patron-social-item');
            const patronId = patronItem?.dataset.patronId; 
            if(patronId && action) handlePatronInteraction(patronId, action); // Delegate all patron actions
        }
    }
    function toggleBarOpen() { 
        if (!openCloseSign) return;
        if (isSetupPhase) { 
            isSetupPhase = false; isBarOpen = true; gameActive = true;
            openCloseSign.textContent = "CLOSE BAR";
            openCloseSign.classList.remove("closed"); openCloseSign.classList.add("open");
            openCloseSign.disabled = false;
            showMessage("Bar is NOW OPEN! Good luck!", "var(--neon-green)");
            updateClockDisplay(); startGameClock(); 
            if (menuMusicPlayer && !menuMusicPlayer.paused) stopMusic(menuMusicPlayer); 
            playMusicForContext('game');  
            updateAllDynamicTabs(); updateIngredientButtons(); updateMixingArea();
            if(serveBtn) serveBtn.disabled = true;
            scheduleNextSpawnAttempt(SPAWN_CHECK_DELAY); 
        } else if (isBarOpen) { 
            showMessage("Closing the bar early...", "var(--neon-orange)");
            openCloseSign.disabled = true; 
            endDay(); 
        }
    }
    
    // --- New UI Screen Flow Functions ---
    function triggerFlashAndShowMenu() {
        if(flashOverlay){
            flashOverlay.style.transition = 'opacity 0.1s ease-out'; // Quick flash in
            flashOverlay.style.opacity = '1';
            flashOverlay.style.visibility = 'visible'; // Make it visible for the flash
            console.log("Flash ON");

            setTimeout(() => {
                flashOverlay.style.transition = 'opacity 0.3s ease-in'; // Fade out
                flashOverlay.style.opacity = '0';
                console.log("Flash FADING OUT");
                setTimeout(() => { 
                    if(flashOverlay) {
                        flashOverlay.style.visibility = 'hidden'; // Hide after fade
                        flashOverlay.classList.remove('active'); // If using .active class from CSS
                    }
                    console.log("Flash OFF. Showing main menu.");
                    showScreen(mainMenuScreen);
                    playMusicForContext('menu');
                }, 300); // Duration of fade out (must match transition)
            }, FLASH_OVERLAY_DURATION_VISIBLE); // Duration flash stays at peak opacity
        } else { 
            showScreen(mainMenuScreen);
            playMusicForContext('menu');
        }
    }

    function handleIntroEnd() {
        console.log("handleIntroEnd called");
        if (introSplashScreen && (introSplashScreen.classList.contains('visible') || getComputedStyle(introSplashScreen).display !== 'none')) {
            const afterIntroHidden = () => {
                if(introSplashScreen) introSplashScreen.removeEventListener('transitionend', afterIntroHidden);
                triggerFlashAndShowMenu();
            };
            if (introSplashScreen) { 
                 introSplashScreen.addEventListener('transitionend', afterIntroHidden, { once: true });
                 hideScreen(introSplashScreen); 
                 console.log("Hiding intro, waiting for transition to trigger flash and menu.");
                 // Fallback if transitionend doesn't fire (e.g., no actual transition occurred)
                 setTimeout(() => { 
                    if (mainMenuScreen && !mainMenuScreen.classList.contains('visible')) { // Check if menu not yet shown
                        console.log("Intro transition fallback, triggering flash and menu.");
                        afterIntroHidden(); // Manually trigger if not already
                    }
                 }, 500); // Slightly longer than expected transition
            }
        } else { 
            console.log("Intro already hidden or not found, triggering flash and menu directly.");
            triggerFlashAndShowMenu(); 
        }
    }

    function handlePlayGame() { 
        console.log("handlePlayGame called");
        hideScreen(mainMenuScreen); // Hide menu immediately
        fadeOutMusic(menuMusicPlayer, () => { // Fade out menu music
            console.log("Menu music faded out. Showing tutorial.");
            isTutorialVisible = true; 
            showScreen(tutorialModal); 
            if (openCloseSign) { 
                openCloseSign.textContent = "SETUP";
                openCloseSign.classList.remove("open"); openCloseSign.classList.add("closed");
                openCloseSign.disabled = true; 
            }
        });
    }

    function handleTutorialEnd() { 
        hideScreen(tutorialModal); isTutorialVisible = false;
        showScreen(gameUIWrapper); 
        isSetupPhase = true; gameActive = false; isBarOpen = false;
        if (openCloseSign) {
            openCloseSign.disabled = false; 
            showMessage("Tutorial closed. Press SETUP to begin Day 1.", "var(--neon-cyan)");
        }
        updateClockDisplay(); updateStaticUIDisplays(); updateAllDynamicTabs(); 
        updateIngredientButtons(); clearMix(); clearCustomerDisplay();
        setActiveTab('recipes'); 
        updateCustomerQueueDisplay(); updatePatronInteractionScreen(); 
    }

    /** Initializes the game: sets up UI states, event listeners, and starts the intro. */
    function initializeGame() {
        console.log("START initializeGame() - CYBERBAR v7.1");
        // 1. Initial UI State
        hideScreen(mainMenuScreen); hideScreen(gameUIWrapper);
        hideScreen(socialUIScreen); hideScreen(jukeboxUIScreen); hideScreen(tutorialModal);
        if(flashOverlay) { flashOverlay.style.opacity = '0';  flashOverlay.style.visibility = 'hidden';}

        if (introSplashScreen) {
            // Intro splash in HTML starts with .visible class.
            // The animation for the logo plays due to CSS.
            // Setup timeout and click to proceed from intro.
            let introHandled = false; 
            const proceedFromIntro = () => {
                if (introHandled) return;
                introHandled = true;
                clearTimeout(introTimeoutId); 
                if(introSplashScreen) introSplashScreen.removeEventListener('click', proceedFromIntro); 
                handleIntroEnd();
            };
            const introTimeoutId = setTimeout(proceedFromIntro, INTRO_SPLASH_DURATION);
            if(introSplashScreen) introSplashScreen.addEventListener('click', proceedFromIntro, { once: true });
        } else { handleIntroEnd(); } // No intro, go to main menu flow

        // 2. Event Listeners
        if (playGameBtn) playGameBtn.addEventListener('click', handlePlayGame);
        if (startGameBtn) startGameBtn.addEventListener('click', handleTutorialEnd);
        if (openCloseSign) openCloseSign.addEventListener('click', toggleBarOpen);
        if (clearBtn) clearBtn.addEventListener('click', clearMix);
        if (serveBtn) serveBtn.addEventListener('click', serveDrink);
        if (shakeBtn) shakeBtn.addEventListener('click', shakeDrink);
        if (queueToggleBtn) queueToggleBtn.addEventListener('click', toggleQueueDisplay);
        const tabButtonContainer = document.getElementById('tab-buttons');
        if (tabButtonContainer) tabButtonContainer.addEventListener('click', handleTabButtonClick);
        [unlocksListDiv, upgradesListDiv, skillsListDiv, queueList, patronInteractionArea].forEach(list => {
            if (list) list.addEventListener('click', handleListButtonClick);
        });
        setupDragAndDropListeners();
        if(openSocialUIBtn) openSocialUIBtn.addEventListener('click', () => { showScreen(socialUIScreen); updatePatronInteractionScreen(); });
        if(closeSocialUIBtn) closeSocialUIBtn.addEventListener('click', () => { hideScreen(socialUIScreen); showScreen(gameUIWrapper); });
        if(openJukeboxBtn) openJukeboxBtn.addEventListener('click', () => {
            showScreen(jukeboxUIScreen);
            if(gameMusicPlayer.paused || !isMusicPlaying || activeMusicPlayer !== gameMusicPlayer) playMusicForContext('jukebox'); 
            else { activeMusicPlayer = gameMusicPlayer; updateJukeboxSongInfo(); if(jukeboxPlayBtn) jukeboxPlayBtn.style.display = 'none'; if(jukeboxPauseBtn) jukeboxPauseBtn.style.display = 'inline-block'; }
        });
        if(closeJukeboxUIBtn) closeJukeboxUIBtn.addEventListener('click', () => {
            hideScreen(jukeboxUIScreen); showScreen(gameUIWrapper);
            if (isBarOpen && gameActive) playMusicForContext('game');
            else if (activeMusicPlayer === gameMusicPlayer) stopMusic(gameMusicPlayer);
            updateJukeboxSongInfo(); 
        });
        if(jukeboxPlayBtn) jukeboxPlayBtn.addEventListener('click', toggleJukeboxPlayPause);
        if(jukeboxPauseBtn) jukeboxPauseBtn.addEventListener('click', toggleJukeboxPlayPause);
        if(jukeboxNextSongBtn) jukeboxNextSongBtn.addEventListener('click', playNextJukeboxSong);
        if(jukeboxPrevSongBtn) jukeboxPrevSongBtn.addEventListener('click', playPrevJukeboxSong);
        
        updateStaticUIDisplays(); updateAllDynamicTabs(); updateIngredientButtons(); 
        updateCustomerQueueDisplay(); updatePatronInteractionScreen(); 
        console.log("Game Initialized. Intro splash should be visible.");
    }

    // --- GAME START ---
    document.addEventListener('DOMContentLoaded', initializeGame);

// --- End of Block 10 / End of IIFE ---
})();