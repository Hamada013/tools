// Exercise content and translations. The interface is in ui.js and the timing in practice.js.
import { u, Qt, Ro, Js, Vi, Uo, zy, Fy, Gy, zo, qo, Ks, Lp, Pp, hy, Bi, Fp, Ho, Lo, Zo, ef, Ky, Ny, Xo, _o, Go, ty, Qo, Bo, Jp, Gp, rf, Wp, Ip, sy, yy, Ey, qy, vy, ng, py, $p, Of, Yy, Py, ry, xy, Ay, _y, Hp, ag, Yp, Sy, qp, Vy, By, tg, jy, wy, sf, ay, Qy, Uy, ny, Iy, ly, nf, af, eg, Ty, lf, ey, dy, iy, Iu, Jy, Ly, Zp, uf, Ry, Wy, Gn, al, Hy, cy, Yo, oy, ky, by, va, Xy, Cy, Zy, Xp, fy, $y, My, Bf, my, ig, Oy, tf, of, Kp, uy, Qp, Dy, gy, fr, Yj, Bj, Uf, R6, Jj, T6, MS, Vf, pS, tS, k6, lS, C6, N6, oj, Hi, YS, wT, vj, bt, Xi, xa, pd, Kx, Xa, Y, $s, nS, q6, Ps, Ui, Fs, Vo, Oo, dj, ij, tj, gT, sT, cf, Mj, yb } from "./vendor.js";

import { App } from './ui.js';

const translations = {
    en: {
      title: "Fluency Flow",
      welcome: "Welcome Back",
      subtitle: "Choose a strategy to practice today.",
      fluencyShaping: "Fluency Shaping",
      fluencyDesc: "Techniques to increase smooth speech through physical control.",
      stutteringMod: "Stuttering Modification",
      stutteringDesc: "Strategies to reduce tension and manage stuttering moments.",
      breathingTech: "Breathing Techniques",
      breathingDesc: "Manage tension and anxiety through diaphragmatic breathing.",
      slowerRate: "Slower Rate",
      easyOnsets: "Easy Onsets",
      easyOnsetDesc: "Gentle breathy starts before speaking to reduce tension.",
      easyOnsetIntro: "Start each word or phrase with a gentle breath (H sound) to ease into speech.",
      cancellationIntro: "After a stuttered word, pause and repeat it with a gentle technique.",
      pullOutIntro: "During a stutter, slow down and transition smoothly into the next sound.",
      prepSetIntro: "Prepare for difficult words by starting them with a gentle technique.",
      lightContacts: "Light Contacts",
      cancellations: "Cancellations",
      pullOuts: "Pull-outs",
      prepSets: "Preparatory Sets",
      fluencyQuote: '"Smooth speech is a journey, not a destination. Take your time with each breath."',
      stutteringQuote: '"Modification is about control and confidence during moments of tension."',
      breathingInfo: {
        title: "Breathing Techniques",
        purpose: "Reduce physical tension and manage speaking anxiety by shifting to deep, controlled breaths.",
        techniques: [{
          name: "Diaphragmatic Breathing (Belly Breathing)",
          steps: ["Place one hand on your chest and the other on your stomach.", "Inhale slowly through your nose, ensuring your stomach rises while your chest stays still.", "Exhale slowly, feeling your stomach fall."]
        }, {
          name: "Regulated Breathing",
          steps: ["Upon feeling a stutter, pause and engage in relaxed diaphragmatic breathing.", "Focus on relaxing the throat and chest muscles.", "Begin speaking on a small, gentle exhale."]
        }, {
          name: "Controlled Exhalation",
          steps: ["Inhale for 3 seconds, then exhale slowly for 6 seconds.", 'Focus on exhaling while producing sound (e.g., "h" or vowel sounds).']
        }],
        tips: ["Practice when calm to make it natural during stress.", "Ensure shoulders and upper chest remain relaxed.", "Avoid over-breathing; aim for a comfortable, moderate breath.", "Sit in a relaxed, upright position."]
      },
      home: "Home",
      profile: "Profile",
      back: "Back",
      fluencyIntro: "Focus on the physical mechanics of speech to create a continuous flow.",
      stutteringIntro: "Learn to stutter more easily and reduce the physical struggle.",
      breathingIntro: "Focus on deep, controlled breaths to relax your speech muscles.",
      inhale: "Inhale",
      exhale: "Exhale",
      hold: "Hold",
      duration: "Duration",
      seconds: "s",
      speed: "Speed",
      normal: "Normal",
      slow: "Slow",
      level: "Level",
      numbers: "Numbers",
      letters: "Letters",
      colors: "Colors",
      animals: "Animals",
      food: "Fruits & Veggies",
      words: "Words",
      sentences: "Sentences",
      stories: "Stories",
      play: "Play",
      pause: "Pause",
      reset: "Reset",
      practice: "Practice",
      next: "Next",
      prev: "Previous",
      info: "Information",
      record: "Record",
      stop: "Stop",
      playRecording: "Play Recording",
      recording: "Recording...",
      clear: "Clear",
      infoDesc: "Learn more about the app and how to use it effectively to improve your fluency.",
      plosives: "Plosives",
      lightContactInfo: {
        title: "Light Contact Strategy",
        purpose: "The primary goal is to minimize, prevent, or reduce the tension associated with stuttering moments.",
        howItWorks: "Instead of pressing lips or tongue together hard (hard contacts), the speaker barely touches the articulators together.",
        targetSounds: "It is most effective for plosive sounds where airflow is obstructed, such as /p/, /b/, /t/, /d/, /k/, and /g/.",
        application: "It is used to start words or phrases with less effort, making speech more comfortable.",
        practiceTips: ["Relaxation: Start with a relaxed breath to reduce overall tension.", "Gentle Movement: Focus on light, controlled, and slow movement of the articulators.", 'Examples: Practice saying words like "ball" or "table" with barely touching lips or tongue.'],
        plosiveDetails: {
          p: "Barely touch your lips together. Imagine you are blowing a tiny bubble that shouldn't pop.",
          b: "Keep your lips very soft and relaxed. Use a tiny amount of voice as you gently release.",
          t: "The tip of your tongue should barely tap the ridge behind your upper teeth.",
          d: "A very light tap with the tongue tip. Keep the contact as brief and soft as possible.",
          k: "The back of your tongue should gently brush the roof of your mouth without pressure.",
          g: "Similar to /k/, but with a soft voice. Focus on the feeling of air flowing through."
        }
      },
      easyOnsetInfo: {
        title: "Easy Onset Strategy",
        purpose: "To start voicing gently and gradually to prevent the vocal folds from slamming together.",
        howItWorks: 'Begin with a soft, breathy "H" sound before transitioning into the vowel or word.',
        practiceTips: ["Exhale slightly before you start speaking.", "Imagine the sound starting as a whisper and growing into a clear voice.", "Keep your throat relaxed and open."]
      },
      cancellationInfo: {
        title: "Cancellation Strategy",
        purpose: "To learn to pause after a stuttered word and repeat it with less tension.",
        howItWorks: "When you stutter, complete the word, pause for a moment, and then say the word again using a fluency technique.",
        practiceTips: ["Complete the stuttered word first.", "Take a full pause, about 3 seconds, to relax your articulators.", "Repeat the word using Easy Onset or Light Contact."]
      },
      pullOutInfo: {
        title: "Pull-out Strategy",
        purpose: "To gain control during a moment of stuttering.",
        howItWorks: "When you feel a block or repetition, don't stop. Instead, slow down the movement and transition smoothly into the next sound.",
        practiceTips: ["Stay in the moment of stuttering without tension.", "Slowly release the tension while continuing to speak.", "Transition smoothly into the next sound or word."]
      },
      prepSetInfo: {
        title: "Preparatory Set Strategy",
        purpose: "To prepare for a word you anticipate will be difficult.",
        howItWorks: "Before you start the word, relax your articulators and use a technique (like easy onset) to start the word smoothly.",
        practiceTips: ["Identify a word you think you might stutter on.", "Pause briefly before the word.", "Start the word with a very gentle, relaxed onset."]
      },
      slowerRateInfo: {
        title: "Slower Rate Strategy",
        purpose: "To give the brain and articulators more time to coordinate speech movements.",
        howItWorks: "Stretching out the vowels and pausing slightly between words or phrases.",
        practiceTips: ["Focus on the vowels in each word.", 'Keep your speech slow and steady.', "Take natural pauses at commas and periods."]
      },
      practiceData: {
        numbers: [{
          text: "1",
          icon: null
        }, {
          text: "2",
          icon: null
        }, {
          text: "3",
          icon: null
        }, {
          text: "4",
          icon: null
        }, {
          text: "5",
          icon: null
        }, {
          text: "6",
          icon: null
        }, {
          text: "7",
          icon: null
        }, {
          text: "8",
          icon: null
        }, {
          text: "9",
          icon: null
        }, {
          text: "10",
          icon: null
        }],
        letterWords: {
          A: ['apple', 'ant', 'arm', 'art', 'ask'], B: ['ball', 'book', 'boat', 'bird', 'bed'],
          C: ['cat', 'cup', 'car', 'cake', 'coat'], D: ['dog', 'door', 'day', 'duck', 'desk'],
          E: ['egg', 'ear', 'eat', 'east', 'easy'], F: ['fish', 'fan', 'food', 'foot', 'farm'],
          G: ['go', 'game', 'gate', 'gift', 'garden'], H: ['hat', 'hand', 'home', 'hill', 'happy'],
          I: ['ice', 'ink', 'in', 'island', 'idea'], J: ['jam', 'jar', 'jump', 'jet', 'juice'],
          K: ['key', 'kite', 'king', 'keep', 'kind'], L: ['lamp', 'leaf', 'leg', 'lake', 'light'],
          M: ['moon', 'milk', 'map', 'mouse', 'morning'], N: ['nose', 'nest', 'net', 'night', 'name'],
          O: ['open', 'ocean', 'oak', 'oval', 'over'], P: ['pen', 'pig', 'park', 'pear', 'paper'],
          Q: ['queen', 'quiet', 'quick', 'quilt', 'question'], R: ['rain', 'red', 'road', 'rose', 'rabbit'],
          S: ['sun', 'sock', 'sea', 'soap', 'sing'], T: ['tree', 'ten', 'table', 'toy', 'tiger'],
          U: ['up', 'under', 'umbrella', 'uncle', 'us'], V: ['van', 'vase', 'vest', 'voice', 'visit'],
          W: ['water', 'wind', 'window', 'walk', 'warm'], X: ['xylophone', 'x-ray'],
          Y: ['yes', 'yellow', 'yard', 'yarn', 'young'], Z: ['zoo', 'zebra', 'zero', 'zip', 'zoom']
        },
        letters: [{
          text: "A",
          icon: null
        }, {
          text: "B",
          icon: null
        }, {
          text: "C",
          icon: null
        }, {
          text: "D",
          icon: null
        }, {
          text: "E",
          icon: null
        }, {
          text: "F",
          icon: null
        }, {
          text: "G",
          icon: null
        }, {
          text: "H",
          icon: null
        }, {
          text: "I",
          icon: null
        }, {
          text: "J",
          icon: null
        }, {
          text: "K",
          icon: null
        }, {
          text: "L",
          icon: null
        }, {
          text: "M",
          icon: null
        }, {
          text: "N",
          icon: null
        }, {
          text: "O",
          icon: null
        }, {
          text: "P",
          icon: null
        }, {
          text: "Q",
          icon: null
        }, {
          text: "R",
          icon: null
        }, {
          text: "S",
          icon: null
        }, {
          text: "T",
          icon: null
        }, {
          text: "U",
          icon: null
        }, {
          text: "V",
          icon: null
        }, {
          text: "W",
          icon: null
        }, {
          text: "X",
          icon: null
        }, {
          text: "Y",
          icon: null
        }, {
          text: "Z",
          icon: null
        }],
        colors: [{
          text: "Red",
          icon: u.jsx(Qt, {
            fill: "#ef4444",
            stroke: "#ef4444"
          })
        }, {
          text: "Blue",
          icon: u.jsx(Qt, {
            fill: "#3b82f6",
            stroke: "#3b82f6"
          })
        }, {
          text: "Green",
          icon: u.jsx(Qt, {
            fill: "#22c55e",
            stroke: "#22c55e"
          })
        }, {
          text: "Yellow",
          icon: u.jsx(Qt, {
            fill: "#eab308",
            stroke: "#eab308"
          })
        }, {
          text: "Orange",
          icon: u.jsx(Qt, {
            fill: "#f97316",
            stroke: "#f97316"
          })
        }, {
          text: "Purple",
          icon: u.jsx(Qt, {
            fill: "#a855f7",
            stroke: "#a855f7"
          })
        }, {
          text: "Pink",
          icon: u.jsx(Qt, {
            fill: "#ec4899",
            stroke: "#ec4899"
          })
        }, {
          text: "Black",
          icon: u.jsx(Qt, {
            fill: "#000000",
            stroke: "#000000"
          })
        }, {
          text: "White",
          icon: u.jsx(Qt, {
            fill: "#ffffff",
            stroke: "#e2e8f0"
          })
        }, {
          text: "Brown",
          icon: u.jsx(Qt, {
            fill: "#78350f",
            stroke: "#78350f"
          })
        }],
        animals: [{
          text: "Cat",
          icon: u.jsx(Ro, {})
        }, {
          text: "Dog",
          icon: u.jsx(Js, {})
        }, {
          text: "Bird",
          icon: u.jsx(Vi, {})
        }, {
          text: "Fish",
          icon: u.jsx(Uo, {})
        }, {
          text: "Rabbit",
          icon: u.jsx(zy, {})
        }, {
          text: "Turtle",
          icon: u.jsx(Fy, {})
        }, {
          text: "Snail",
          icon: u.jsx(Gy, {})
        }, {
          text: "Bug",
          icon: u.jsx(zo, {})
        }, {
          text: "Beetle",
          icon: u.jsx(zo, {})
        }, {
          text: "Mouse",
          icon: u.jsx(qo, {})
        }],
        food: [{
          text: "Apple",
          icon: u.jsx(Ks, {})
        }, {
          text: "Banana",
          icon: u.jsx(Lp, {})
        }, {
          text: "Cherry",
          icon: u.jsx(Pp, {})
        }, {
          text: "Grape",
          icon: u.jsx(hy, {})
        }, {
          text: "Orange",
          icon: u.jsx(Bi, {})
        }, {
          text: "Lemon",
          icon: u.jsx(Bi, {})
        }, {
          text: "Carrot",
          icon: u.jsx(Fp, {})
        }, {
          text: "Pear",
          icon: u.jsx(Bi, {})
        }, {
          text: "Leaf",
          icon: u.jsx(Ho, {})
        }, {
          text: "Flower",
          icon: u.jsx(Lo, {})
        }],
        words: [{
          text: "Apple",
          icon: u.jsx(Ks, {})
        }, {
          text: "Sun",
          icon: u.jsx(Zo, {})
        }, {
          text: "Cloud",
          icon: u.jsx(ef, {})
        }, {
          text: "Cat",
          icon: u.jsx(Ro, {})
        }, {
          text: "Dog",
          icon: u.jsx(Js, {})
        }, {
          text: "Tree",
          icon: u.jsx(Ky, {})
        }, {
          text: "Moon",
          icon: u.jsx(Ny, {})
        }, {
          text: "Star",
          icon: u.jsx(Xo, {})
        }, {
          text: "Book",
          icon: u.jsx(_o, {})
        }, {
          text: "Pen",
          icon: u.jsx(Go, {})
        }, {
          text: "Coffee",
          icon: u.jsx(ty, {})
        }, {
          text: "Table",
          icon: u.jsx(Qo, {})
        }, {
          text: "Door",
          icon: u.jsx(Bo, {})
        }, {
          text: "Car",
          icon: u.jsx(Jp, {})
        }, {
          text: "Bike",
          icon: u.jsx(Gp, {})
        }, {
          text: "Plane",
          icon: u.jsx(rf, {})
        }, {
          text: "Fish",
          icon: u.jsx(Uo, {})
        }, {
          text: "Bird",
          icon: u.jsx(Vi, {})
        }, {
          text: "Flower",
          icon: u.jsx(Lo, {})
        }, {
          text: "Leaf",
          icon: u.jsx(Ho, {})
        }, {
          text: "Rain",
          icon: u.jsx(Wp, {})
        }, {
          text: "Snow",
          icon: u.jsx(Ip, {})
        }, {
          text: "Fire",
          icon: u.jsx(sy, {})
        }, {
          text: "Heart",
          icon: u.jsx(yy, {})
        }, {
          text: "Music",
          icon: u.jsx(Ey, {})
        }, {
          text: "Phone",
          icon: u.jsx(qy, {})
        }, {
          text: "Laptop",
          icon: u.jsx(vy, {})
        }, {
          text: "Watch",
          icon: u.jsx(ng, {})
        }, {
          text: "Headphones",
          icon: u.jsx(py, {})
        }, {
          text: "Camera",
          icon: u.jsx($p, {})
        }, {
          text: "Mic",
          icon: u.jsx(Of, {})
        }, {
          text: "Speaker",
          icon: u.jsx(Yy, {})
        }, {
          text: "TV",
          icon: u.jsx(Py, {})
        }, {
          text: "Game",
          icon: u.jsx(ry, {})
        }, {
          text: "Mouse",
          icon: u.jsx(qo, {})
        }, {
          text: "Keys",
          icon: u.jsx(xy, {})
        }, {
          text: "Screen",
          icon: u.jsx(Ay, {})
        }, {
          text: "Print",
          icon: u.jsx(_y, {})
        }, {
          text: "Battery",
          icon: u.jsx(Hp, {})
        }, {
          text: "Wifi",
          icon: u.jsx(ag, {})
        }, {
          text: "Blue",
          icon: u.jsx(Yp, {})
        }, {
          text: "Mail",
          icon: u.jsx(Sy, {})
        }, {
          text: "Bell",
          icon: u.jsx(qp, {})
        }, {
          text: "Search",
          icon: u.jsx(Vy, {})
        }, {
          text: "Settings",
          icon: u.jsx(By, {})
        }, {
          text: "User",
          icon: u.jsx(tg, {})
        }, {
          text: "Lock",
          icon: u.jsx(jy, {})
        }, {
          text: "Unlock",
          icon: u.jsx(wy, {})
        }, {
          text: "Key",
          icon: u.jsx(sf, {})
        }, {
          text: "Eye",
          icon: u.jsx(ay, {})
        }, {
          text: "Trash",
          icon: u.jsx(Qy, {})
        }, {
          text: "Share",
          icon: u.jsx(Uy, {})
        }, {
          text: "Down",
          icon: u.jsx(ny, {})
        }, {
          text: "Up",
          icon: u.jsx(Iy, {})
        }, {
          text: "Folder",
          icon: u.jsx(ly, {})
        }, {
          text: "File",
          icon: u.jsx(nf, {})
        }, {
          text: "Image",
          icon: u.jsx(af, {})
        }, {
          text: "Video",
          icon: u.jsx(eg, {})
        }, {
          text: "Map",
          icon: u.jsx(Ty, {})
        }, {
          text: "Nav",
          icon: u.jsx(lf, {})
        }, {
          text: "Compass",
          icon: u.jsx(ey, {})
        }, {
          text: "Globe",
          icon: u.jsx(dy, {})
        }, {
          text: "Flag",
          icon: u.jsx(iy, {})
        }, {
          text: "Anchor",
          icon: u.jsx(Iu, {})
        }, {
          text: "Truck",
          icon: u.jsx(Jy, {})
        }, {
          text: "Ship",
          icon: u.jsx(Ly, {})
        }, {
          text: "Bus",
          icon: u.jsx(Zp, {})
        }, {
          text: "Train",
          icon: u.jsx(uf, {})
        }, {
          text: "Rocket",
          icon: u.jsx(Ry, {})
        }, {
          text: "Umbrella",
          icon: u.jsx(Wy, {})
        }, {
          text: "Wind",
          icon: u.jsx(Gn, {})
        }, {
          text: "Zap",
          icon: u.jsx(al, {})
        }, {
          text: "Skull",
          icon: u.jsx(Hy, {})
        }, {
          text: "Ghost",
          icon: u.jsx(cy, {})
        }, {
          text: "Smile",
          icon: u.jsx(Yo, {})
        }, {
          text: "Frown",
          icon: u.jsx(oy, {})
        }, {
          text: "Meh",
          icon: u.jsx(ky, {})
        }, {
          text: "Laugh",
          icon: u.jsx(by, {})
        }, {
          text: "Pulse",
          icon: u.jsx(va, {})
        }, {
          text: "Doctor",
          icon: u.jsx(Xy, {})
        }, {
          text: "Pill",
          icon: u.jsx(Cy, {})
        }, {
          text: "Syringe",
          icon: u.jsx(Zy, {})
        }, {
          text: "Work",
          icon: u.jsx(Xp, {})
        }, {
          text: "Grad",
          icon: u.jsx(fy, {})
        }, {
          text: "Trophy",
          icon: u.jsx($y, {})
        }, {
          text: "Medal",
          icon: u.jsx(My, {})
        }, {
          text: "Target",
          icon: u.jsx(Bf, {})
        }, {
          text: "Hammer",
          icon: u.jsx(my, {})
        }, {
          text: "Wrench",
          icon: u.jsx(ig, {})
        }, {
          text: "Cut",
          icon: u.jsx(Oy, {})
        }, {
          text: "Brush",
          icon: u.jsx(tf, {})
        }, {
          text: "Art",
          icon: u.jsx(of, {})
        }, {
          text: "Math",
          icon: u.jsx(Kp, {})
        }, {
          text: "Gift",
          icon: u.jsx(uy, {})
        }, {
          text: "Cake",
          icon: u.jsx(Qp, {})
        }, {
          text: "Pizza",
          icon: u.jsx(Dy, {})
        }, {
          text: "Ice",
          icon: u.jsx(gy, {})
        }],
        plosives: [{
          text: "P - Pen",
          icon: u.jsx(Go, {})
        }, {
          text: "B - Ball",
          icon: u.jsx(Qt, {})
        }, {
          text: "T - Table",
          icon: u.jsx(Qo, {})
        }, {
          text: "D - Dog",
          icon: u.jsx(Js, {})
        }, {
          text: "K - Key",
          icon: u.jsx(sf, {})
        }, {
          text: "G - Go",
          icon: u.jsx(fr, {})
        }, {
          text: "P - Paper",
          icon: u.jsx(nf, {})
        }, {
          text: "B - Book",
          icon: u.jsx(_o, {})
        }, {
          text: "T - Ten",
          icon: u.jsx(Yj, {})
        }, {
          text: "D - Door",
          icon: u.jsx(Bo, {})
        }],
        sentences: ["The cat is sleeping.", "I like to eat apples.", "The sun is very hot.", "I have a blue car.", "The birds are singing.", "It is raining outside.", "I read a book today.", "The flowers are beautiful.", "I drink water every day.", "The sky is very clear.", "I go to school now.", "My dog is very friendly.", "I love my family.", "The tree is very tall.", "I see a big plane.", "The fish is swimming.", "I sit on the chair.", "The door is open.", "I write with a pen.", "The moon is bright.", "I play with my friends.", "The snow is white.", "I eat a tasty meal.", "The star is far away.", "I am happy today.", "The grass is green.", "I wear a warm coat.", "The wind is blowing.", "I like to swim.", "The cake is sweet.", "I see a red bird.", "The mountain is high.", "I walk in the park.", "The river is wide.", "I have a new toy.", "The clock is ticking.", "I listen to music.", "The soup is hot.", "I jump very high.", "The ball is round.", "I draw a picture.", "The baby is crying.", "I help my mother.", "The father is working.", "I sleep in my bed.", "The window is clean.", "I open the box.", "The light is on.", "I close the book.", "The road is long.", "I run in the field.", "The horse is fast.", "I see a small bug.", "The elephant is big.", "I like the zoo.", "The lion is loud.", "I eat some bread.", "The milk is cold.", "I have ten fingers.", "The shoes are black.", "I wear a hat.", "The shirt is clean.", "I wash my hands.", "The soap is bubbly.", "I brush my teeth.", "The mirror is shiny.", "I look at myself.", "The house is big.", "I live in a city.", "The farm has cows.", "I see a tractor.", "The corn is yellow.", "I pick a flower.", "The bee is buzzing.", "I like the honey.", "The ant is small.", "I watch the rain.", "The umbrella is wet.", "I walk in puddles.", "The mud is sticky.", "I build a tower.", "The blocks are colorful.", "I share my toys.", "The teacher is kind.", "I learn new things.", "The school is fun.", "I have a backpack.", "The pencil is sharp.", "I write my name.", "The paper is white.", "I fold the paper.", "The plane is flying.", "I see the clouds.", "The sky is blue.", "The stars are bright.", "I wish on a star.", "The night is quiet.", "I dream of magic.", "The world is big.", "I am a good kid."],
        stories: ["Once upon a time, a small blue bird lived in a giant oak tree. Every morning, it would wake up early to sing a beautiful song to the sun. The other animals in the forest would stop and listen to the sweet melody. It made everyone feel happy and ready for the new day ahead.", "A curious cat named Luna found a shiny red ball in the garden. She chased it through the tall grass and under the wooden bench. The ball bounced high into the air, and Luna jumped with all her might to catch it. After hours of playing, she curled up in a sunny spot for a long nap.", "The golden sun began to set behind the distant purple mountains. As the sky turned shades of orange and pink, the first bright star appeared. The silver moon rose slowly, casting a soft glow over the quiet meadow. It was a peaceful night, and the world was finally going to sleep.", "Last Saturday, my family and I went to the local park for a picnic. We found a perfect spot under a shady willow tree near the pond. I saw a big, friendly dog playing fetch with its owner in the distance. We ate delicious sandwiches and enjoyed the fresh air all afternoon.", "A gentle rain started to fall from the heavy grey clouds above. The thirsty flowers lifted their heads to drink the cool water. Soon, the dry brown grass began to turn a vibrant shade of green. A beautiful rainbow appeared in the sky, stretching from one side of the valley to the other.", "The brave explorer climbed the highest mountain in the world. He carried a heavy backpack filled with tools and supplies. The wind was cold and strong, but he did not give up. When he finally reached the top, he saw the most amazing view he had ever seen.", "In a small village, there was a baker who made the best bread. Every morning, the smell of fresh bread would fill the streets. People would line up outside his shop to buy a warm loaf. He always had a kind smile and a friendly word for every customer.", "The little robot wanted to learn how to paint like a human. It gathered many colors and a large white canvas. At first, it only made messy lines and spots. But with a lot of practice, it created a beautiful picture of a garden filled with flowers.", "A giant whale swam through the deep blue ocean. It traveled thousands of miles to find a warmer place for the winter. Along the way, it met many interesting sea creatures like dolphins and turtles. The ocean was full of wonder and mystery for the giant whale.", "The old library was filled with thousands of ancient books. The air smelled like old paper and dust. A young student spent every afternoon reading about history and science. She loved to get lost in the stories and learn about the world from the past.", "A small village nestled in the valley was known for its magical clock tower. Every hour, the clock would chime a melody that could be heard for miles. Legend says that the clock was built by a wizard who wanted to bring peace to the land. Whenever the music played, people would stop their work and smile at their neighbors.", "The old forest was home to a tree that grew silver leaves. These leaves would glow softly in the moonlight, illuminating the path for lost travelers. Many people tried to find the tree, but it only appeared to those who were truly kind of heart. One young girl found it while searching for her lost kitten.", "A group of children discovered a hidden cave behind a waterfall during their summer vacation. Inside, the walls were covered in ancient paintings of stars and planets. They felt like they had stepped into another world entirely. They promised to keep the cave a secret and returned every day to explore its mysteries.", "The master gardener spent years creating a maze made of fragrant rose bushes. People traveled from far away to walk through the winding paths and smell the sweet perfume. In the center of the maze was a beautiful marble fountain that sparkled in the sun. It was a place where anyone could find quiet and beauty.", "A lonely lighthouse stood on a rocky cliff, guiding ships safely through the stormy seas. The lighthouse keeper was an old man who loved the sound of the crashing waves. He spent his nights polishing the giant lens and watching the distant lights of passing boats. He knew every rock and current in the dangerous waters.", "The secret garden was hidden behind a tall stone wall covered in ivy. Inside, flowers of every color bloomed all year round, even in the middle of winter. A small wooden bridge crossed a sparkling stream where golden fish swam lazily. It was a magical place where time seemed to stand still and worries disappeared.", "A young musician found an old violin in the attic of his grandfather's house. When he played it, the music was so beautiful that birds would gather on the windowsill to listen. He practiced every day, and soon he was invited to play in the grand concert hall. His music brought joy to everyone who heard it.", "The clever fox lived in a cozy den under the roots of a great oak tree. He was known for his ability to solve any problem and help his forest friends. One day, he helped a lost owl find its way home by following the patterns of the stars. The fox was a true friend to all the creatures in the woods.", "A giant castle made of ice stood at the very top of the world. It was ruled by a queen who could control the wind and the snow with a wave of her hand. The castle sparkled like a diamond in the bright northern lights. Many brave knights tried to reach the castle, but only the bravest could withstand the cold.", "The friendly dragon lived in a large cave filled with books instead of gold. He loved to read stories about far-off lands and exciting adventures. Sometimes, he would invite the village children to the cave and read to them by the warmth of his gentle fire. Everyone in the village loved the book-loving dragon.", "A small wooden boat sailed across the calm lake at dawn. The morning mist rose from the water, creating a mysterious and beautiful scene. A fisherman sat quietly in the boat, waiting for the first catch of the day. The only sound was the gentle lapping of the water against the side of the boat.", "The busy city was filled with tall buildings that reached for the sky. People hurried along the sidewalks, going about their daily lives with purpose. At night, the city transformed into a sea of twinkling lights and colorful signs. It was a place of endless energy and excitement, where something new was always happening.", "A group of hikers followed a narrow trail through the dense pine forest. The air was cool and smelled of pine needles and damp earth. They climbed higher and higher until they reached a rocky outcrop with a stunning view of the valley below. It was a challenging hike, but the reward was worth it.", "The old clockmaker spent his days repairing delicate watches and grand grandfather clocks. His shop was filled with the sound of hundreds of ticking clocks, creating a rhythmic and soothing atmosphere. He had a steady hand and a keen eye for detail, and he took great pride in his craftsmanship.", "A beautiful butterfly with bright blue wings emerged from its cocoon in the spring. It fluttered from flower to flower, drinking sweet nectar and enjoying the warm sunshine. It was a symbol of new beginnings and the beauty of nature. The butterfly's journey was just beginning as it explored the vibrant garden.", "The mysterious island was surrounded by a thick fog that never lifted. Sailors told stories of hidden treasures and strange creatures that lived on the island. A brave captain decided to sail through the fog and discover the island's secrets. What he found was a tropical paradise filled with exotic fruits and colorful birds.", "A young scientist spent years studying the stars through a giant telescope. He discovered a new planet that was covered in oceans of liquid silver. His discovery changed the way people thought about the universe and inspired a new generation of explorers. He was honored with a prestigious award for his groundbreaking work.", "The cozy cottage was nestled in a field of wildflowers at the edge of the woods. A warm fire crackled in the fireplace, and the smell of baking cookies filled the air. It was a place of comfort and peace, where friends and family gathered to share stories and laughter. The cottage was a true home.", "A brave knight rode his white horse through the dark and dangerous forest. He was on a quest to find a magical sword that could defeat the evil sorcerer. He faced many challenges along the way, but his courage and determination never wavered. He knew that the fate of the kingdom rested on his shoulders.", "The ancient temple was hidden deep in the jungle, covered in vines and moss. It was built thousands of years ago by a civilization that had long since disappeared. A team of archaeologists carefully cleared away the jungle to reveal the temple's stunning carvings and hidden chambers. It was a discovery of a lifetime.", "A small stream flowed gently through the meadow, providing water for the thirsty animals. The water was clear and cool, and small pebbles sparkled on the bottom. In the spring, the banks of the stream were lined with bright yellow primroses. It was a peaceful and beautiful place to sit and enjoy the sounds of nature.", "The grand theater was filled with people dressed in their finest clothes. They had come to see a performance of a famous play that had been written hundreds of years ago. The actors performed with passion and skill, and the audience was captivated by the story. It was a night of magic and wonder that they would never forget.", "A young artist sat in the park with her sketchbook and pencils. She drew the people walking by, the trees swaying in the wind, and the birds flying overhead. She had a talent for capturing the beauty in everyday moments. Her sketches were filled with life and emotion, and she hoped to one day become a famous painter.", "The old windmill stood on a hill, its giant sails turning slowly in the breeze. It had been used for generations to grind grain into flour for the village. The miller was a hardworking man who took great care of the windmill. He loved the sound of the sails turning and the smell of fresh flour.", "A group of scientists lived in a research station at the South Pole. They studied the ice and the weather to learn more about the Earth's climate. It was a cold and harsh environment, but they were dedicated to their work. They spent their days collecting data and their nights watching the amazing aurora australis.", "The secret path led through a tunnel of tall hedges to a hidden pond. The water was still and reflected the surrounding trees like a mirror. A family of ducks lived on the pond, and they would swim gracefully across the water. It was a quiet and secluded spot where anyone could go to escape the busy world.", "A young boy found a message in a bottle while walking along the beach. The message was written in a language he didn't understand, but it was accompanied by a map of a distant island. He spent weeks trying to translate the message and study the map. He dreamed of one day going on an adventure to find the island.", "The busy market was filled with the sounds of people bargaining and the smells of exotic spices. Stalls were piled high with colorful fruits, handmade crafts, and beautiful fabrics. It was a vibrant and exciting place where people from all over the world came to trade and share their cultures.", "A wise old owl lived in a hollow tree in the middle of the forest. The other animals would come to him for advice and guidance. He had seen many things in his long life and had a deep understanding of the world. He was a respected and loved member of the forest community.", "The beautiful garden was filled with flowers that bloomed in every season. In the spring, there were tulips and daffodils; in the summer, roses and lilies; in the autumn, chrysanthemums; and in the winter, snowdrops. It was a place of constant beauty and change, where nature's wonders were always on display.", "A young girl learned how to bake bread from her grandmother. They would spend the afternoon in the kitchen, mixing the flour and water and kneading the dough. The smell of fresh bread baking in the oven was the best smell in the world. She loved learning the old traditions and sharing the warm bread with her family.", "The old train chugged slowly through the mountains, its whistle echoing through the valleys. The passengers looked out the windows at the stunning scenery of snow-capped peaks and sparkling lakes. It was a slow and peaceful journey that allowed them to appreciate the beauty of the world.", "A group of volunteers spent their weekend planting trees in the local park. They wanted to create a better environment for the future and provide a home for the birds and animals. It was hard work, but they felt a sense of pride and accomplishment. They knew that their efforts would make a difference for generations to come.", "The mysterious book was bound in dark leather and had a silver lock. It was found in a hidden compartment of an old desk. No one knew who had written the book or what secrets it contained. A young historian spent years trying to open the lock and discover the book's mysteries.", "A beautiful swan swam gracefully across the lake, its white feathers reflecting in the water. It was a symbol of elegance and beauty. The swan lived on the lake with its family, and they would spend their days swimming and searching for food. It was a peaceful and serene life.", "The old bridge was made of stone and had stood for hundreds of years. It crossed a wide river that flowed through the center of the town. People walked across the bridge every day, going about their business. It was a landmark that connected the two sides of the town and held many memories for the local people.", "A young boy built a treehouse in the giant maple tree in his backyard. He spent his summer afternoons in the treehouse, reading books and playing games with his friends. It was his own secret place where he could imagine he was an explorer or a pirate. The treehouse was a place of endless fun and adventure.", "The busy harbor was filled with ships of all sizes, from small fishing boats to giant cargo ships. The sound of foghorns and the smell of salt air filled the atmosphere. It was a place of constant activity and trade, where goods from all over the world were brought to the city.", "A beautiful sunset painted the sky in shades of orange, pink, and purple. The sun slowly disappeared below the horizon, leaving behind a soft glow. It was a moment of peace and beauty that marked the end of another day. The world was quiet as the first stars began to appear in the darkening sky.", "The old clock in the town square had been ticking for over a hundred years. It was a symbol of the town's history and a constant reminder of the passing of time. People would gather in the square to hear the clock chime the hour. It was a beloved landmark that held a special place in the hearts of the townspeople."],
        practice: []
      }
    },
    ar: {
      title: "كلام وطلاقة",
      welcome: "مرحباً بك مجدداً",
      subtitle: "اختر استراتيجية للتدريب عليها اليوم.",
      fluencyShaping: "تشكيل الطلاقة",
      fluencyDesc: "تقنيات لزيادة طلاقة الكلام من خلال التحكم الجسدي.",
      stutteringMod: "تعديل التأتأة",
      stutteringDesc: "استراتيجيات لتقليل التوتر وإدارة لحظات التأتأة.",
      breathingTech: "تقنيات التنفس",
      breathingDesc: "إدارة التوتر والقلق من خلال التنفس الحجابي.",
      slowerRate: "معدل أبطأ",
      easyOnsets: "بدايات سهلة",
      easyOnsetDesc: "بدايات لطيفة مع التنفس قبل التحدث لتقليل التوتر.",
      easyOnsetIntro: "ابدأ كل كلمة أو عبارة بتنفس لطيف (صوت هـ) لتسهيل الكلام.",
      cancellationIntro: "بعد الكلمة التي حدثت فيها تأتأة، توقف وأعدها بتقنية لطيفة.",
      pullOutIntro: "أثناء التأتأة، أبطئ الحركة وانتقل بسلاسة إلى الصوت التالي.",
      prepSetIntro: "استعد للكلمات الصعبة من خلال بدئها بتقنية لطيفة.",
      lightContacts: "لمسات خفيفة",
      cancellations: "الإلغاء",
      pullOuts: "الانسحاب",
      prepSets: "التهيئة المسبقة",
      fluencyQuote: '"الكلام السلس رحلة وليس وجهة. خذ وقتك مع كل نفس."',
      stutteringQuote: '"التعديل يدور حول السيطرة والثقة خلال لحظات التوتر."',
      breathingInfo: {
        title: "تقنيات التنفس",
        purpose: "تقليل التوتر الجسدي وإدارة قلق التحدث من خلال الانتقال إلى أنفاس عميقة ومنضبطة.",
        techniques: [{
          name: "التنفس الحجابي (تنفس البطن)",
          steps: ["ضع إحدى يديك على صدرك والأخرى على بطنك.", "استنشق ببطء من خلال أنفك، وتأكد من ارتفاع بطنك بينما يظل صدرك ساكناً نسبياً.", "ازفر ببطء، واشعر ببطنك ينخفض."]
        }, {
          name: "التنفس المنظم",
          steps: ["عند الشعور بالتأتأة، توقف عن الكلام ومارس التنفس الحجابي المسترخي.", "ركز على إرخاء عضلات الحلق والصدر.", "ابدأ التحدث بزفير صغير ولطيف."]
        }, {
          name: "الزفير المنضبط",
          steps: ["خذ شهيقاً لمدة ثلاث ثوانٍ، ثم ازفر ببطء لمدة ست ثوانٍ مع إبقاء الكتفين مسترخيين.", 'ركز على الزفير أثناء إصدار الصوت (مثل صوت "هـ" أو حروف العلة).']
        }],
        tips: ["تدرب عندما تكون هادئاً لتجعلها طبيعية أثناء مواقف التحدث المجهدة.", "تأكد من بقاء الكتفين وأعلى الصدر مسترخيين لتجنب التوتر.", "تجنب التنفس المفرط؛ اهدف إلى نفس مريح ومعتدل.", "اجلس في وضع مريح ومستقيم مع دعم الظهر."]
      },
      home: "الرئيسية",
      profile: "الملف الشخصي",
      back: "رجوع",
      fluencyIntro: "ركز على الميكانيكا الجسدية للكلام لخلق تدفق مستمر.",
      stutteringIntro: "تعلّم كيف تتأتأ بسهولة أكبر وتقلّل الجهد الجسدي.",
      breathingIntro: "ركز على أنفاس عميقة ومنضبطة لإرخاء عضلات الكلام.",
      inhale: "شهيق",
      exhale: "زفير",
      hold: "توقف",
      duration: "المدة",
      seconds: "ث",
      speed: "السرعة",
      normal: "طبيعي",
      slow: "بطيء",
      level: "المستوى",
      numbers: "الأرقام",
      letters: "الحروف",
      colors: "الألوان",
      animals: "الحيوانات",
      food: "خضار وفواكه",
      words: "كلمات",
      sentences: "جمل",
      stories: "قصص",
      play: "تشغيل",
      pause: "إيقاف",
      reset: "إعادة",
      practice: "التدريب",
      next: "التالي",
      prev: "السابق",
      info: "معلومات",
      record: "تسجيل",
      stop: "إيقاف",
      playRecording: "تشغيل التسجيل",
      recording: "جاري التسجيل...",
      clear: "مسح",
      infoDesc: "تعرف على المزيد حول التطبيق وكيفية استخدامه بفعالية لتحسين طلاقتك.",
      plosives: "الحروف الانفجارية",
      lightContactInfo: {
        title: "استراتيجية اللمس الخفيف",
        purpose: "الهدف الأساسي هو تقليل أو منع التوتر المرتبط بلحظات التأتأة.",
        howItWorks: "بدلاً من الضغط بقوة على الشفتين أو اللسان، يلمس المتحدث أعضاء النطق ببعضها البعض بخفة شديدة.",
        targetSounds: "تكون أكثر فعالية مع الأصوات الانفجارية حيث يتم إعاقة تدفق الهواء، مثل /ب/، /ت/، /د/، /ك/، /ق/، /ط/.",
        application: "تُستخدم لبدء الكلمات أو الجمل بجهد أقل، مما يجعل الكلام أكثر راحة.",
        practiceTips: ["الاسترخاء: ابدأ بتنفس مريح لتقليل التوتر العام.", "حركة لطيفة: ركز على حركة خفيفة ومنضبطة وبطيئة لأعضاء النطق.", 'أمثلة: تدرب على قول كلمات مثل "باب" أو "طاولة" مع لمس الشفتين أو اللسان بخفة شديدة.'],
        plosiveDetails: {
          ب: "المس شفتيك معاً بالكاد. تخيل أنك تنفخ فقاعة صغيرة جداً لا يجب أن تنفجر.",
          ت: "يجب أن يلمس طرف لسانك بالكاد المنطقة خلف أسنانك العلوية.",
          د: "نقرة خفيفة جداً بطرف اللسان. اجعل اللمس قصيراً وناعماً قدر الإمكان.",
          ط: "لمسة خفيفة جداً بطرف اللسان مع سقف الحلق الصلب.",
          ك: "يجب أن يلمس الجزء الخلفي من لسانك سقف فمك بلطف دون أي ضغط.",
          ق: "لمسة خفيفة جداً للجزء الخلفي من اللسان مع الحنك الرخو."
        }
      },
      easyOnsetInfo: {
        title: "استراتيجية البداية السهلة",
        purpose: "بدء الصوت بلطف وتدريج لمنع انغلاق الحبال الصوتية بقوة.",
        howItWorks: 'ابدأ بصوت "هـ" ناعم قبل الانتقال إلى الكلمة.',
        practiceTips: ["ازفر قليلاً قبل البدء في الكلام.", "تخيل أن الصوت يبدأ كهمس ثم يتحول إلى صوت واضح.", "حافظ على حلقك مسترخياً ومفتوحاً."]
      },
      cancellationInfo: {
        title: "استراتيجية الإلغاء",
        purpose: "تعلم التوقف بعد الكلمة التي حدثت فيها تأتأة وإعادتها بتوتر أقل.",
        howItWorks: "عندما تتأتأ، أكمل الكلمة، توقف للحظة، ثم قل الكلمة مرة أخرى باستخدام تقنية الطلاقة.",
        practiceTips: ["أكمل الكلمة المتأتأ بها أولاً.", "خذ وقفة كاملة، نحو ثلاث ثوانٍ، لإرخاء أعضاء النطق.", "أعد الكلمة باستخدام البداية السهلة أو اللمس الخفيف."]
      },
      pullOutInfo: {
        title: "استراتيجية الانسحاب",
        purpose: "السيطرة خلال لحظة التأتأة.",
        howItWorks: "عندما تشعر بانغلاق أو تكرار، لا تتوقف. بدلاً من ذلك، أبطئ الحركة وانتقل بسلاسة إلى الصوت التالي.",
        practiceTips: ["ابق في لحظة التأتأة دون توتر.", "قلل التوتر ببطء أثناء الاستمرار في الكلام.", "انتقل بسلاسة إلى الصوت أو الكلمة التالية."]
      },
      prepSetInfo: {
        title: "استراتيجية التهيئة المسبقة",
        purpose: "الاستعداد لكلمة تتوقع أنها ستكون صعبة.",
        howItWorks: "قبل أن تبدأ الكلمة، أرخِ أعضاء النطق واستخدم تقنية (مثل البداية السهلة) لبدء الكلمة بسلاسة.",
        practiceTips: ["حدد الكلمة التي تعتقد أنك قد تتأتأ فيها.", "توقف لفترة وجيزة قبل الكلمة.", "ابدأ الكلمة ببدء لطيف ومسترخٍ للغاية."]
      },
      slowerRateInfo: {
        title: "استراتيجية المعدل البطيء",
        purpose: "إعطاء الدماغ وأعضاء النطق مزيداً من الوقت لتنسيق حركات الكلام.",
        howItWorks: "إطالة الحركات الصوتية والتوقف قليلاً بين الكلمات.",
        practiceTips: ["ركز على إطالة الحروف المتحركة في كل كلمة.", 'حافظ على كلام بطيء وثابت.', "خذ فترات توقف طبيعية عند الفواصل والنقاط."]
      },
      practiceData: {
        numbers: [{
          text: "١",
          icon: null
        }, {
          text: "٢",
          icon: null
        }, {
          text: "٣",
          icon: null
        }, {
          text: "٤",
          icon: null
        }, {
          text: "٥",
          icon: null
        }, {
          text: "٦",
          icon: null
        }, {
          text: "٧",
          icon: null
        }, {
          text: "٨",
          icon: null
        }, {
          text: "٩",
          icon: null
        }, {
          text: "١٠",
          icon: null
        }],
        letterWords: {
          أ: ["أرنب", "أسد", "أمل", "أنا", "أمي", "أب", "أكل", "أحب", "أبيض", "أخضر"],
          ب: ["باب", "بطة", "بيت", "بحر", "بنت", "بصل", "برتقال", "بنطلون", "برق", "بسمة"],
          ت: ["تفاح", "تمر", "تين", "تمساح", "تاج", "تراب", "تلفاز", "توت", "تحت", "ترك"],
          ث: ["ثلج", "ثوب", "ثعبان", "ثمار", "ثوم", "ثور", "ثقيل", "ثعلب", "ثلاثة", "ثمن"],
          ج: ["جمل", "جرس", "جبل", "جدار", "جدي", "جزرة", "جسر", "جندي", "جوال", "جائع"],
          ح: ["حلم", "حليب", "حصان", "حوت", "حمام", "حديقة", "حلوى", "حر", "حقل", "حبل"],
          خ: ["خبز", "خروف", "خريطة", "خيار", "خاتم", "خشب", "خوخ", "خيمة", "خروج", "خل"],
          د: ["ديك", "دلو", "دب", "درج", "دراجة", "دواء", "دفتر", "دمية", "دجاجة", "دار"],
          ذ: ["ذيل", "ذبابة", "ذرة", "ذهب", "ذئب", "ذكي", "ذراع", "ذوق", "ذكر", "ذهن"],
          ر: ["رمان", "رجل", "رسالة", "رأس", "رمل", "ربيع", "ريشة", "رعد", "ربح", "رياح"],
          ز: ["زرافة", "زيت", "زهرة", "زورق", "زنبق", "زبادي", "زلزال", "زوج", "زر", "زيتون"],
          س: ["سيارة", "سحابة", "ساعة", "سمكة", "سكين", "سكر", "سباحة", "سرير", "سلام", "سفينة"],
          ش: ["شمس", "شجرة", "شتاء", "شارع", "شمعة", "شاي", "شعر", "شنطة", "شيكولاتة", "شلال"],
          ص: ["صقر", "صندوق", "صباح", "صابون", "صوص", "صياد", "صيف", "صوت", "صورة", "صديق"],
          ض: ["ضفدع", "ضوء", "ضرس", "ضيف", "ضمادة", "ضباب", "ضرب", "ضحك", "ضلع", "ضمن"],
          ط: ["طائرة", "طاولة", "طير", "طفل", "طريق", "طبيب", "طعام", "طباشير", "طلب", "طبل"],
          ظ: ["ظرف", "ظهر", "ظل", "ظفر", "ظلام", "ظبي", "ظن", "ظريف", "ظلم"],
          ع: ["عين", "عصفور", "علم", "عنب", "عسل", "عقل", "عريس", "عشاء", "عطلة", "عجلة"],
          غ: ["غابة", "غزال", "غيمة", "غراب", "غداء", "غسالة", "غطاء", "غصن", "غبار", "غنى"],
          ف: ["فراشة", "فيل", "فواكه", "فستان", "فأس", "فصل", "فجر", "فم", "فكر", "فوز"],
          ق: ["قلم", "قمر", "قطة", "قفص", "قلب", "قطار", "قبعة", "قميص", "قدم", "قوي"],
          ك: ["كتاب", "كلب", "كرسي", "كوب", "كرة", "كعكة", "كهف", "كتف", "كنز", "كسل"],
          ل: ["ليمون", "لاعب", "ليل", "لسان", "لون", "لحم", "لؤلؤ", "لوحة", "لوز", "ليفة"],
          م: ["موز", "مفتاح", "ماء", "مدرسة", "مقص", "ملعقة", "معلم", "منزل", "مسجد", "مطر"],
          ن: ["نخلة", "نملة", "نحلة", "نجوم", "نار", "نمر", "نظارة", "نهر", "نوم", "نبض"],
          هـ: ["هلال", "هواء", "هدية", "هاتف", "هرم", "هروب", "هدوء", "هذه", "هو", "هي"],
          و: ["ولد", "ورد", "وجه", "ورقة", "وحيد", "وعاء", "وادي", "وطن", "وزة", "وقت"],
          ي: ["يد", "يمامة", "يسار", "ياسمين", "يوم", "يقطين", "ينبوع", "يقين", "يكبر", "يمشي"]
        },
        letters: [{
          text: "أ",
          icon: null
        }, {
          text: "ب",
          icon: null
        }, {
          text: "ت",
          icon: null
        }, {
          text: "ث",
          icon: null
        }, {
          text: "ج",
          icon: null
        }, {
          text: "ح",
          icon: null
        }, {
          text: "خ",
          icon: null
        }, {
          text: "د",
          icon: null
        }, {
          text: "ذ",
          icon: null
        }, {
          text: "ر",
          icon: null
        }, {
          text: "ز",
          icon: null
        }, {
          text: "س",
          icon: null
        }, {
          text: "ش",
          icon: null
        }, {
          text: "ص",
          icon: null
        }, {
          text: "ض",
          icon: null
        }, {
          text: "ط",
          icon: null
        }, {
          text: "ظ",
          icon: null
        }, {
          text: "ع",
          icon: null
        }, {
          text: "غ",
          icon: null
        }, {
          text: "ف",
          icon: null
        }, {
          text: "ق",
          icon: null
        }, {
          text: "ك",
          icon: null
        }, {
          text: "ل",
          icon: null
        }, {
          text: "م",
          icon: null
        }, {
          text: "ن",
          icon: null
        }, {
          text: "هـ",
          icon: null
        }, {
          text: "و",
          icon: null
        }, {
          text: "ي",
          icon: null
        }],
        colors: [{
          text: "أحمر",
          icon: u.jsx(Qt, {
            fill: "#ef4444",
            stroke: "#ef4444"
          })
        }, {
          text: "أزرق",
          icon: u.jsx(Qt, {
            fill: "#3b82f6",
            stroke: "#3b82f6"
          })
        }, {
          text: "أخضر",
          icon: u.jsx(Qt, {
            fill: "#22c55e",
            stroke: "#22c55e"
          })
        }, {
          text: "أصفر",
          icon: u.jsx(Qt, {
            fill: "#eab308",
            stroke: "#eab308"
          })
        }, {
          text: "برتقالي",
          icon: u.jsx(Qt, {
            fill: "#f97316",
            stroke: "#f97316"
          })
        }, {
          text: "بنفسجي",
          icon: u.jsx(Qt, {
            fill: "#a855f7",
            stroke: "#a855f7"
          })
        }, {
          text: "وردي",
          icon: u.jsx(Qt, {
            fill: "#ec4899",
            stroke: "#ec4899"
          })
        }, {
          text: "أسود",
          icon: u.jsx(Qt, {
            fill: "#000000",
            stroke: "#000000"
          })
        }, {
          text: "أبيض",
          icon: u.jsx(Qt, {
            fill: "#ffffff",
            stroke: "#e2e8f0"
          })
        }, {
          text: "بني",
          icon: u.jsx(Qt, {
            fill: "#78350f",
            stroke: "#78350f"
          })
        }],
        animals: [{
          text: "قطة",
          icon: u.jsx(Ro, {})
        }, {
          text: "كلب",
          icon: u.jsx(Js, {})
        }, {
          text: "عصفور",
          icon: u.jsx(Vi, {})
        }, {
          text: "سمكة",
          icon: u.jsx(Uo, {})
        }, {
          text: "أرنب",
          icon: u.jsx(zy, {})
        }, {
          text: "سلحفاة",
          icon: u.jsx(Fy, {})
        }, {
          text: "حلزون",
          icon: u.jsx(Gy, {})
        }, {
          text: "حشرة",
          icon: u.jsx(zo, {})
        }, {
          text: "خنفساء",
          icon: u.jsx(zo, {})
        }, {
          text: "فأر",
          icon: u.jsx(qo, {})
        }],
        food: [{
          text: "تفاحة",
          icon: u.jsx(Ks, {})
        }, {
          text: "موز",
          icon: u.jsx(Lp, {})
        }, {
          text: "كرز",
          icon: u.jsx(Pp, {})
        }, {
          text: "عنب",
          icon: u.jsx(hy, {})
        }, {
          text: "برتقال",
          icon: u.jsx(Bi, {})
        }, {
          text: "ليمون",
          icon: u.jsx(Bi, {})
        }, {
          text: "جزر",
          icon: u.jsx(Fp, {})
        }, {
          text: "كمثرى",
          icon: u.jsx(Bi, {})
        }, {
          text: "ورقة",
          icon: u.jsx(Ho, {})
        }, {
          text: "زهرة",
          icon: u.jsx(Lo, {})
        }],
        words: [{
          text: "تفاحة",
          icon: u.jsx(Ks, {})
        }, {
          text: "شمس",
          icon: u.jsx(Zo, {})
        }, {
          text: "سحابة",
          icon: u.jsx(ef, {})
        }, {
          text: "قطة",
          icon: u.jsx(Ro, {})
        }, {
          text: "كلب",
          icon: u.jsx(Js, {})
        }, {
          text: "شجرة",
          icon: u.jsx(Ky, {})
        }, {
          text: "قمر",
          icon: u.jsx(Ny, {})
        }, {
          text: "نجمة",
          icon: u.jsx(Xo, {})
        }, {
          text: "كتاب",
          icon: u.jsx(_o, {})
        }, {
          text: "قلم",
          icon: u.jsx(Go, {})
        }, {
          text: "قهوة",
          icon: u.jsx(ty, {})
        }, {
          text: "طاولة",
          icon: u.jsx(Qo, {})
        }, {
          text: "باب",
          icon: u.jsx(Bo, {})
        }, {
          text: "سيارة",
          icon: u.jsx(Jp, {})
        }, {
          text: "دراجة",
          icon: u.jsx(Gp, {})
        }, {
          text: "طائرة",
          icon: u.jsx(rf, {})
        }, {
          text: "سمكة",
          icon: u.jsx(Uo, {})
        }, {
          text: "عصفور",
          icon: u.jsx(Vi, {})
        }, {
          text: "زهرة",
          icon: u.jsx(Lo, {})
        }, {
          text: "ورقة",
          icon: u.jsx(Ho, {})
        }, {
          text: "مطر",
          icon: u.jsx(Wp, {})
        }, {
          text: "ثلج",
          icon: u.jsx(Ip, {})
        }, {
          text: "نار",
          icon: u.jsx(sy, {})
        }, {
          text: "قلب",
          icon: u.jsx(yy, {})
        }, {
          text: "موسيقى",
          icon: u.jsx(Ey, {})
        }, {
          text: "هاتف",
          icon: u.jsx(qy, {})
        }, {
          text: "حاسوب",
          icon: u.jsx(vy, {})
        }, {
          text: "ساعة",
          icon: u.jsx(ng, {})
        }, {
          text: "سماعة",
          icon: u.jsx(py, {})
        }, {
          text: "كاميرا",
          icon: u.jsx($p, {})
        }, {
          text: "ميكروفون",
          icon: u.jsx(Of, {})
        }, {
          text: "مكبر",
          icon: u.jsx(Yy, {})
        }, {
          text: "تلفاز",
          icon: u.jsx(Py, {})
        }, {
          text: "لعبة",
          icon: u.jsx(ry, {})
        }, {
          text: "فأرة",
          icon: u.jsx(qo, {})
        }, {
          text: "لوحة",
          icon: u.jsx(xy, {})
        }, {
          text: "شاشة",
          icon: u.jsx(Ay, {})
        }, {
          text: "طابعة",
          icon: u.jsx(_y, {})
        }, {
          text: "بطارية",
          icon: u.jsx(Hp, {})
        }, {
          text: "واي فاي",
          icon: u.jsx(ag, {})
        }, {
          text: "بلوتوث",
          icon: u.jsx(Yp, {})
        }, {
          text: "بريد",
          icon: u.jsx(Sy, {})
        }, {
          text: "جرس",
          icon: u.jsx(qp, {})
        }, {
          text: "بحث",
          icon: u.jsx(Vy, {})
        }, {
          text: "إعدادات",
          icon: u.jsx(By, {})
        }, {
          text: "مستخدم",
          icon: u.jsx(tg, {})
        }, {
          text: "قفل",
          icon: u.jsx(jy, {})
        }, {
          text: "فتح",
          icon: u.jsx(wy, {})
        }, {
          text: "مفتاح",
          icon: u.jsx(sf, {})
        }, {
          text: "عين",
          icon: u.jsx(ay, {})
        }, {
          text: "سلة",
          icon: u.jsx(Qy, {})
        }, {
          text: "مشاركة",
          icon: u.jsx(Uy, {})
        }, {
          text: "تحميل",
          icon: u.jsx(ny, {})
        }, {
          text: "رفع",
          icon: u.jsx(Iy, {})
        }, {
          text: "مجلد",
          icon: u.jsx(ly, {})
        }, {
          text: "ملف",
          icon: u.jsx(nf, {})
        }, {
          text: "صورة",
          icon: u.jsx(af, {})
        }, {
          text: "فيديو",
          icon: u.jsx(eg, {})
        }, {
          text: "خريطة",
          icon: u.jsx(Ty, {})
        }, {
          text: "ملاحة",
          icon: u.jsx(lf, {})
        }, {
          text: "بوصلة",
          icon: u.jsx(ey, {})
        }, {
          text: "عالم",
          icon: u.jsx(dy, {})
        }, {
          text: "علم",
          icon: u.jsx(iy, {})
        }, {
          text: "مرساة",
          icon: u.jsx(Iu, {})
        }, {
          text: "شاحنة",
          icon: u.jsx(Jy, {})
        }, {
          text: "سفينة",
          icon: u.jsx(Ly, {})
        }, {
          text: "حافلة",
          icon: u.jsx(Zp, {})
        }, {
          text: "قطار",
          icon: u.jsx(uf, {})
        }, {
          text: "صاروخ",
          icon: u.jsx(Ry, {})
        }, {
          text: "مظلة",
          icon: u.jsx(Wy, {})
        }, {
          text: "ريح",
          icon: u.jsx(Gn, {})
        }, {
          text: "صاعقة",
          icon: u.jsx(al, {})
        }, {
          text: "جمجمة",
          icon: u.jsx(Hy, {})
        }, {
          text: "شبح",
          icon: u.jsx(cy, {})
        }, {
          text: "ابتسامة",
          icon: u.jsx(Yo, {})
        }, {
          text: "حزن",
          icon: u.jsx(oy, {})
        }, {
          text: "عادي",
          icon: u.jsx(ky, {})
        }, {
          text: "ضحك",
          icon: u.jsx(by, {})
        }, {
          text: "نبض",
          icon: u.jsx(va, {})
        }, {
          text: "طبيب",
          icon: u.jsx(Xy, {})
        }, {
          text: "دواء",
          icon: u.jsx(Cy, {})
        }, {
          text: "حقنة",
          icon: u.jsx(Zy, {})
        }, {
          text: "عمل",
          icon: u.jsx(Xp, {})
        }, {
          text: "تخرج",
          icon: u.jsx(fy, {})
        }, {
          text: "كأس",
          icon: u.jsx($y, {})
        }, {
          text: "ميدالية",
          icon: u.jsx(My, {})
        }, {
          text: "هدف",
          icon: u.jsx(Bf, {})
        }, {
          text: "مطرقة",
          icon: u.jsx(my, {})
        }, {
          text: "مقص",
          icon: u.jsx(Oy, {})
        }, {
          text: "فرشاة",
          icon: u.jsx(tf, {})
        }, {
          text: "فن",
          icon: u.jsx(of, {})
        }, {
          text: "حساب",
          icon: u.jsx(Kp, {})
        }, {
          text: "هدية",
          icon: u.jsx(uy, {})
        }, {
          text: "كعكة",
          icon: u.jsx(Qp, {})
        }, {
          text: "بيتزا",
          icon: u.jsx(Dy, {})
        }, {
          text: "بوظة",
          icon: u.jsx(gy, {})
        }, {
          text: "نظارات",
          icon: u.jsx(Bj, {})
        }, {
          text: "مشط",
          icon: u.jsx(Gn, {})
        }, {
          text: "صابون",
          icon: u.jsx(al, {})
        }, {
          text: "منشفة",
          icon: u.jsx(Uf, {})
        }, {
          text: "مرآة",
          icon: u.jsx(af, {})
        }, {
          text: "سرير",
          icon: u.jsx(R6, {})
        }, {
          text: "وسادة",
          icon: u.jsx(ef, {})
        }, {
          text: "غطاء",
          icon: u.jsx(Jj, {})
        }, {
          text: "خزانة",
          icon: u.jsx(T6, {})
        }, {
          text: "رف",
          icon: u.jsx(MS, {})
        }, {
          text: "نافذة",
          icon: u.jsx(Vf, {})
        }, {
          text: "ستارة",
          icon: u.jsx(pS, {})
        }, {
          text: "مصباح",
          icon: u.jsx(tS, {})
        }, {
          text: "مكتب",
          icon: u.jsx(Qo, {})
        }, {
          text: "كرسي",
          icon: u.jsx(k6, {})
        }, {
          text: "سجادة",
          icon: u.jsx(Vf, {})
        }, {
          text: "أرض",
          icon: u.jsx(lS, {})
        }, {
          text: "سقف",
          icon: u.jsx(C6, {})
        }, {
          text: "درج",
          icon: u.jsx(N6, {})
        }, {
          text: "مصعد",
          icon: u.jsx(oj, {})
        }, {
          text: "شارع",
          icon: u.jsx(lf, {})
        }, {
          text: "رصيف",
          icon: u.jsx(Hi, {})
        }, {
          text: "إشارة",
          icon: u.jsx(YS, {})
        }, {
          text: "جسر",
          icon: u.jsx(wT, {})
        }, {
          text: "نفق",
          icon: u.jsx(vj, {})
        }, {
          text: "مطار",
          icon: u.jsx(rf, {})
        }, {
          text: "محطة",
          icon: u.jsx(uf, {})
        }, {
          text: "ميناء",
          icon: u.jsx(Iu, {})
        }],
        plosives: [{
          text: "ب - باب",
          icon: u.jsx(Bo, {})
        }, {
          text: "ت - تفاح",
          icon: u.jsx(Ks, {})
        }, {
          text: "د - دجاجة",
          icon: u.jsx(Vi, {})
        }, {
          text: "ك - كتاب",
          icon: u.jsx(_o, {})
        }, {
          text: "ق - قلم",
          icon: u.jsx(Go, {})
        }, {
          text: "ط - طاولة",
          icon: u.jsx(fr, {})
        }, {
          text: "ب - بطة",
          icon: u.jsx(Vi, {})
        }, {
          text: "ت - تمر",
          icon: u.jsx(Qt, {})
        }, {
          text: "د - دب",
          icon: u.jsx(va, {})
        }, {
          text: "ك - كرة",
          icon: u.jsx(Qt, {})
        }],
        sentences: ["القطة نائمة الآن.", "أحب أكل التفاح.", "الشمس حارة جداً.", "لدي سيارة زرقاء.", "العصافير تغرد بجمال.", "إنها تمطر في الخارج.", "قرأت كتاباً اليوم.", "الزهور جميلة جداً.", "أشرب الماء كل يوم.", "السماء صافية تماماً.", "أذهب إلى المدرسة الآن.", "كلبي ودود للغاية.", "أنا أحب عائلتي.", "الشجرة طويلة جداً.", "أرى طائرة كبيرة.", "السمكة تسبح في الماء.", "أجلس على الكرسي.", "الباب مفتوح الآن.", "أكتب بالقلم بوضوح.", "القمر ساطع في الليل.", "ألعب مع أصدقائي.", "الثلج أبيض وبارد.", "آكل وجبة لذيذة.", "النجمة بعيدة جداً.", "أنا سعيد اليوم.", "العشب أخضر جميل.", "أرتدي معطفاً دافئاً.", "الرياح تهب بقوة.", "أحب السباحة كثيراً.", "الكعكة حلوة المذاق.", "أرى عصفوراً أحمر.", "الجبل عالٍ جداً.", "أمشي في الحديقة.", "النهر واسع وعميق.", "لدي لعبة جديدة.", "الساعة تدق بانتظام.", "أستمع إلى الموسيقى.", "الحساء ساخن ولذيذ.", "أقفز عالياً جداً.", "الكرة مستديرة تماماً.", "أرسم لوحة جميلة.", "الطفل يبكي بصوت.", "أساعد أمي دائماً.", "أبي يعمل بجد.", "أنام في سريري.", "النافذة نظيفة جداً.", "أفتح الصندوق الكبير.", "الضوء مشتعل الآن.", "أغلق الكتاب بهدوء.", "الطريق طويل جداً.", "أركض في الحقل.", "الحصان سريع جداً.", "أرى حشرة صغيرة.", "الفيل ضخم للغاية.", "أحب حديقة الحيوان.", "الأسد صوته عالٍ.", "آكل بعض الخبز.", "الحليب بارد ومنعش.", "لدي عشر أصابع.", "الحذاء أسود اللون.", "أرتدي قبعة جميلة.", "القميص نظيف ومرتب.", "أغسل يدي بالماء.", "الصابون له فقاعات.", "أنظف أسناني جيداً.", "المرآة لامعة جداً.", "أنظر إلى نفسي.", "البيت كبير وواسع.", "أعيش في مدينة.", "المزرعة بها أبقار.", "أرى جراراً كبيراً.", "الذرة صفراء اللون.", "أقطف زهرة جميلة.", "النحلة تطن حولي.", "أحب العسل كثيراً.", "النملة صغيرة جداً.", "أراقب سقوط المطر.", "المظلة مبللة بالماء.", "أمشي في البرك.", "الطين لزج جداً.", "أبني برجاً عالياً.", "المكعبات ملونة جداً.", "أشارك ألعابي معهم.", "المعلمة طيبة القلب.", "أتعلم أشياء جديدة.", "المدرسة ممتعة جداً.", "لدي حقيبة ظهر.", "القلم مبري وحاد.", "أكتب اسمي بوضوح.", "الورقة بيضاء ونظيفة.", "أطوي الورقة بدقة.", "الطائرة تطير عالياً.", "أرى السحب البيضاء.", "السماء زرقاء صافية.", "النجوم لامعة جداً.", "أتمنى أمنية للنجمة.", "الليل هادئ وساكن.", "أحلم بالسحر والجمال.", "العالم كبير وواسع.", "أنا طفل مهذب."],
        stories: ["في قديم الزمان، عاش عصفور أزرق صغير في شجرة بلوط عملاقة. في كل صباح، كان يستيقظ باكراً ليغني أغنية جميلة للشمس الساطعة. كانت الحيوانات الأخرى في الغابة تتوقف لتستمع إلى اللحن العذب. كان ذلك يجعل الجميع يشعرون بالسعادة والاستعداد ليوم جديد مليء بالأمل.", "وجدت قطة فضولية تدعى لونا كرة حمراء لامعة في الحديقة الواسعة. طاردتها عبر العشب الطويل وتحت المقعد الخشبي القديم. قفزت الكرة عالياً في الهواء، وقفزت لونا بكل قوتها لتمسك بها. بعد ساعات من اللعب والمرح، استلقت في بقعة مشمسة لتأخذ قيلولة طويلة ومريحة.", "بدأت الشمس الذهبية تغيب خلف الجبال الأرجوانية البعيدة في الأفق. وبينما تحولت السماء إلى درجات البرتقالي والوردي، ظهرت أول نجمة لامعة. ارتفع القمر الفضي ببطء، ملقياً ضوءاً ناعماً على المرج الهادئ. كانت ليلة هادئة وساكنة، وبدأ العالم أخيراً في الاستسلام للنوم العميق.", "في يوم السبت الماضي، ذهبت مع عائلتي إلى المنتزه المحلي لقضاء نزهة ممتعة. وجدنا مكاناً مثالياً تحت شجرة صفصاف ظليلة بالقرب من البركة. رأيت كلباً كبيراً وودوداً يلعب مع صاحبه في الأفق البعيد. أكلنا شطائر لذيذة واستمتعنا بالهواء النقي طوال فترة بعد الظهر.", "بدأ مطر خفيف يسقط من السحب الرمادية الثقيلة في السماء العالية. رفعت الزهور العطشى رؤوسها لتشرب من الماء البارد المنعش. وسرعان ما بدأ العشب البني الجاف يتحول إلى اللون الأخضر النابض بالحياة. ظهر قوس قزح جميل في السماء، يمتد من جانب إلى آخر فوق الوادي الخصيب.", "تسلق المستكشف الشجاع أعلى جبل في العالم. كان يحمل حقيبة ظهر ثقيلة مليئة بالأدوات والمؤن. كانت الرياح باردة وقوية، لكنه لم يستسلم أبداً. عندما وصل أخيراً إلى القمة، رأى أروع منظر شاهده في حياته على الإطلاق.", "في قرية صغيرة، كان هناك خباز يصنع أفضل خبز. في كل صباح، كانت رائحة الخبز الطازج تملأ الشوارع. كان الناس يصطفون خارج محله لشراء رغيف دافئ. كان لديه دائماً ابتسامة طيبة وكلمة ودودة لكل زبون.", "أراد الروبوت الصغير أن يتعلم كيف يرسم مثل البشر. جمع الكثير من الألوان ولوحة قماشية بيضاء كبيرة. في البداية، صنع فقط خطوطاً وبقعاً فوضوية. ولكن مع الكثير من التدريب، رسم لوحة جميلة لحديقة مليئة بالزهور الملونة.", "سبح حوت عملاق عبر المحيط الأزرق العميق. سافر آلاف الأميال ليجد مكاناً أكثر دفئاً لفصل الشتاء. في طريقه، التقى بالعديد من المخلوقات البحرية المثيرة للاهتمام مثل الدلافين والسلاحف. كان المحيط مليئاً بالعجائب والغموض بالنسبة للحوت العملاق.", "كانت المكتبة القديمة مليئة بآلاف الكتب العتيقة. كانت رائحة الهواء تشبه الورق القديم والغبار. قضت طالبة شابة كل بعد ظهر في القراءة عن التاريخ والعلوم. كانت تحب أن تضيع في القصص وتتعلم عن العالم من الماضي البعيد.", "كانت هناك قرية صغيرة تقع في الوادي، مشهورة ببرج ساعتها السحري. في كل ساعة، كانت الساعة تدق لحناً يمكن سماعه على بعد أميال. تقول الأسطورة أن الساعة بناها ساحر أراد إحلال السلام في الأرض. كلما عزفت الموسيقى، كان الناس يتوقفون عن عملهم ويبتسمون لجيرانهم.", "كانت الغابة القديمة موطناً لشجرة تنبت أوراقاً فضية. كانت هذه الأوراق تتوهج بنعومة تحت ضوء القمر، لتنير الطريق للمسافرين التائهين. حاول الكثير من الناس العثور على الشجرة، لكنها لم تظهر إلا لأولئك الذين كانت قلوبهم طيبة حقاً. وجدتها فتاة صغيرة بينما كانت تبحث عن قطتها المفقودة.", "اكتشفت مجموعة من الأطفال كهفاً مخفياً خلف شلال خلال عطلتهم الصيفية. في الداخل، كانت الجدران مغطاة بلوحات قديمة للنجوم والكواكب. شعروا وكأنهم خطوا إلى عالم آخر تماماً. وعدوا بالحفاظ على سر الكهف وعادوا كل يوم لاستكشاف أسراره.", "قضى البستاني الماهر سنوات في إنشاء متاهة مصنوعة من شجيرات الورد العطرة. سافر الناس من أماكن بعيدة للمشي عبر المسارات المتعرجة وشم العطر الزكي. في وسط المتاهة كانت هناك نافورة رخامية جميلة تتلألأ في الشمس. كان مكاناً يمكن لأي شخص أن يجد فيه الهدوء والجمال.", "وقف منارة وحيدة على منحدر صخري، ترشد السفن بأمان عبر البحار العاصفة. كان حارس المنارة رجلاً عجوزاً يحب صوت الأمواج المتلاطمة. قضى لياليه في تلميع العدسة العملاقة ومراقبة الأضواء البعيدة للقوارب المارة. كان يعرف كل صخرة وتيار في المياه الخطرة.", "كانت الحديقة السرية مخبأة خلف جدار حجري طويل مغطى باللبلاب. في الداخل، كانت الزهور من كل لون تتفتح طوال العام، حتى في منتصف الشتاء. عبر جسر خشبي صغير جدولاً متلألئاً حيث كانت الأسماك الذهبية تسبح بكسل. كان مكاناً سحرياً حيث يبدو أن الوقت يتوقف وتختفي الهموم.", "وجد موسيقي شاب كماناً قديماً في علية منزل جده. عندما عزف عليه، كانت الموسيقى جميلة لدرجة أن الطيور كانت تتجمع على حافة النافذة للاستماع. تدرب كل يوم، وسرعان ما دعي للعزف في قاعة الحفلات الكبرى. جلبت موسيقاه الفرح لكل من سمعها.", "عاش الثعلب الذكي في وكر مريح تحت جذور شجرة بلوط كبيرة. كان معروفاً بقدرته على حل أي مشكلة ومساعدة أصدقائه في الغابة. في أحد الأيام، ساعد بومة تائهة في العثور على طريقها إلى المنزل من خلال اتباع أنماط النجوم. كان الثعلب صديقاً حقيقياً لجميع المخلوقات في الغابة.", "قلعة جليدية عملاقة وقفت في قمة العالم تماماً. كانت تحكمها ملكة يمكنها التحكم في الرياح والثلج بلمحة من يدها. تلألأت القلعة مثل الماس في أضواء الشمال الساطعة. حاول العديد من الفرسان الشجعان الوصول إلى القلعة، لكن الأشجع فقط من استطاع تحمل البرد.", "عاش التنين الودود في كهف كبير مليء بالكتب بدلاً من الذهب. كان يحب قراءة القصص عن الأراضي البعيدة والمغامرات المثيرة. أحياناً، كان يدعو أطفال القرية إلى الكهف ويقرأ لهم بجانب دفء ناره اللطيفة. أحب الجميع في القرية التنين المحب للكتب.", "أبحر قارب خشبي صغير عبر البحيرة الهادئة عند الفجر. ارتفع ضباب الصباح من الماء، مما خلق مشهداً غامضاً وجميلاً. جلس صياد بهدوء في القارب، ينتظر أول صيد في اليوم. كان الصوت الوحيد هو تلاطم الماء اللطيف ضد جانب القارب.", "كانت المدينة المزدحمة مليئة بالمباني العالية التي تصل إلى السماء. سارع الناس على طول الأرصفة، يمارسون حياتهم اليومية بهدف. في الليل، تحولت المدينة إلى بحر من الأضواء المتلألئة واللافتات الملونة. كانت مكاناً للطاقة والإثارة اللامتناهية، حيث يحدث شيء جديد دائماً.", "اتبعت مجموعة من المتنزهين مساراً ضيقاً عبر غابة الصنوبر الكثيفة. كان الهواء بارداً ورائحته تشبه إبر الصنوبر والأرض الرطبة. تسلقوا أعلى وأعلى حتى وصلوا إلى نتوء صخري بمنظر رائع للوادي أدناه. كانت رحلة صعبة، لكن المكافأة كانت تستحق العناء.", "قضى صانع الساعات العجوز أيامه في إصلاح الساعات الرقيقة وساعات الجد الكبيرة. كان محله مليئاً بصوت مئات الساعات التي تكتك، مما خلق جواً إيقاعياً ومهدئاً. كان لديه يد ثابتة وعين حريصة على التفاصيل، وكان يفخر كثيراً بحرفته.", "ظهرت فراشة جميلة بأجنحة زرقاء زاهية من شرنقتها في الربيع. رفت من زهرة إلى زهرة، تشرب الرحيق الحلو وتستمتع بأشعة الشمس الدافئة. كانت رمزاً للبدايات الجديدة وجمال الطبيعة. كانت رحلة الفراشة قد بدأت للتو وهي تستكشف الحديقة النابضة بالحياة.", "كانت الجزيرة الغامضة محاطة بضباب كثيف لا يرتفع أبداً. حكى البحارة قصصاً عن كنوز مخفية ومخلوقات غريبة تعيش في الجزيرة. قرر قبطان شجاع الإبحار عبر الضباب واكتشاف أسرار الجزيرة. ما وجده كان جنة استوائية مليئة بالفواكه الغريبة والطيور الملونة.", "قضى عالم شاب سنوات في دراسة النجوم من خلال تلسكوب عملاق. اكتشف كوكباً جديداً مغطى بمحيطات من الفضة السائلة. غير اكتشافه الطريقة التي يفكر بها الناس في الكون وألهم جيلاً جديداً من المستكشفين. تم تكريمه بجائزة مرموقة لعمله الرائد.", "كان الكوخ المريح يقع في حقل من الزهور البرية عند حافة الغابة. كانت نار دافئة تفرقع في المدفأة، ورائحة خبز الكعك تملأ الهواء. كان مكاناً للراحة والسلام، حيث يجتمع الأصدقاء والعائلة لمشاركة القصص والضحك. كان الكوخ بيتاً حقيقياً.", "ركب فارس شجاع حصانه الأبيض عبر الغابة المظلمة والخطيرة. كان في مهمة للعثور على سيف سحري يمكنه هزيمة الساحر الشرير. واجه العديد من التحديات على طول الطريق، لكن شجاعته وتصميمه لم يتزعزعا أبداً. كان يعلم أن مصير المملكة يقع على عاتقه.", "كان المعبد القديم مخبأً في أعماق الغابة، مغطى بالكروم والطحالب. تم بناؤه قبل آلاف السنين من قبل حضارة اختفت منذ زمن طويل. قام فريق من علماء الآثار بإزالة الغابة بعناية للكشف عن منحوتات المعبد المذهلة والغرف المخفية. كان اكتشاف العمر.", "تدفق جدول صغير بلطف عبر المرج، موفراً الماء للحيوانات العطشى. كان الماء صافياً وبارداً، وتلألأت الحصى الصغيرة في القاع. في الربيع، كانت ضفاف الجدول تصطف بأزهار الربيع الصفراء الزاهية. كان مكاناً هادئاً وجميلاً للجلوس والاستمتاع بأصوات الطبيعة.", "كان المسرح الكبير مليئاً بالناس الذين يرتدون أرقى ملابسهم. جاءوا لمشاهدة عرض لمسرحية شهيرة كتبت قبل مئات السنين. أدى الممثلون بشغف ومهارة، وانبهر الجمهور بالقصة. كانت ليلة من السحر والعجائب التي لن ينسوها أبداً.", "جلست فنانة شابة في الحديقة مع دفتر رسمها وأقلامها. رسمت الناس المارين، والأشجار التي تتمايل في الريح، والطيور التي تطير فوق الرأس. كان لديها موهبة في التقاط الجمال في اللحظات اليومية. كانت رسوماتها مليئة بالحياة والعاطفة، وتمنت أن تصبح يوماً ما رسامة مشهورة.", "وقفت طاحونة الهواء القديمة على تلة، وأشرعتها العملاقة تدور ببطء في النسيم. تم استخدامها لأجيال لطحن الحبوب وتحويلها إلى دقيق للقرية. كان الطحان رجلاً مجتهداً يعتني جيداً بطاحونة الهواء. كان يحب صوت دوران الأشرعة ورائحة الدقيق الطازج.", "عاشت مجموعة من العلماء في محطة أبحاث في القطب الجنوبي. درسوا الجليد والطقس لمعرفة المزيد عن مناخ الأرض. كانت بيئة باردة وقاسية، لكنهم كانوا مخلصين لعملهم. قضوا أيامهم في جمع البيانات ولياليهم في مشاهدة الأضواء الجنوبية المذهلة.", "أدى المسار السري عبر نفق من التحوطات العالية إلى بركة مخفية. كان الماء ساكناً ويعكس الأشجار المحيطة مثل المرآة. عاشت عائلة من البط في البركة، وكانوا يسبحون برشاقة عبر الماء. كان مكاناً هادئاً ومنعزلاً حيث يمكن لأي شخص الذهاب للهروب من العالم المزدحم.", "وجد صبي صغير رسالة في زجاجة أثناء مشيه على طول الشاطئ. كانت الرسالة مكتوبة بلغة لا يفهمها، لكنها كانت مصحوبة بخريطة لجزيرة بعيدة. قضى أسابيع في محاولة ترجمة الرسالة ودراسة الخريطة. حلم بالذهاب يوماً ما في مغامرة للعثور على الجزيرة.", "كان السوق المزدحم مليئاً بأصوات الناس الذين يساومون وروائح التوابل الغريبة. كانت الأكشاك مكدسة بالفواكه الملونة، والحرف اليدوية، والأقمشة الجميلة. كان مكاناً نابضاً بالحياة ومثيراً حيث يأتي الناس من جميع أنحاء العالم للتجارة ومشاركة ثقافاتهم.", "عاش بومة عجوز حكيم في شجرة مجوفة في وسط الغابة. كانت الحيوانات الأخرى تأتي إليه لطلب النصيحة والإرشاد. لقد رأى أشياء كثيرة في حياته الطويلة وكان لديه فهم عميق للعالم. كان عضواً محترماً ومحبوباً في مجتمع الغابة.", "كانت الحديقة الجميلة مليئة بالزهور التي تتفتح في كل موسم. في الربيع، كانت هناك زهور التوليب والنرجس؛ في الصيف، الورود والزنابق؛ في الخريف، الأقحوان؛ وفي الشتاء، أزهار الثلج. كان مكاناً للجمال والتغيير المستمر، حيث كانت عجائب الطبيعة معروضة دائماً.", "تعلمت فتاة صغيرة كيفية خبز الخبز من جدتها. كانوا يقضون فترة بعد الظهر في المطبخ، يخلطون الدقيق والماء ويعجنون العجين. كانت رائحة الخبز الطازج الذي يخبز في الفرن أفضل رائحة في العالم. أحبت تعلم التقاليد القديمة ومشاركة الخبز الدافئ مع عائلتها.", "سار القطار القديم ببطء عبر الجبال، وصدا صفارته يتردد في الوديان. نظر الركاب من النوافذ إلى المناظر الخلابة للقمم المغطاة بالثلوج والبحيرات المتلألئة. كانت رحلة بطيئة وهادئة سمحت لهم بتقدير جمال العالم.", "قضت مجموعة من المتطوعين عطلة نهاية الأسبوع في زراعة الأشجار في الحديقة المحلية. أرادوا خلق بيئة أفضل للمستقبل وتوفير منزل للطيور والحيوانات. كان عملاً شاقاً، لكنهم شعروا بالفخر والإنجاز. علموا أن جهودهم ستحدث فرقاً للأجيال القادمة.", "كان الكتاب الغامض مجلداً بجلد داكن وله قفل فضي. تم العثور عليه في حجرة مخفية في مكتب قديم. لم يعرف أحد من كتب الكتاب أو الأسرار التي يحتوي عليها. قضى مؤرخ شاب سنوات في محاولة فتح القفل واكتشاف أسرار الكتاب.", "سبحت بجعة جميلة برشاقة عبر البحيرة، وريشها الأبيض ينعكس في الماء. كانت رمزاً للأناقة والجمال. عاشت البجعة في البحيرة مع عائلتها، وكانوا يقضون أيامهم في السباحة والبحث عن الطعام. كانت حياة هادئة وهانئة.", "كان الجسر القديم مصنوعاً من الحجر وصمد لمئات السنين. عبر نهراً واسعاً يتدفق عبر وسط المدينة. مشى الناس عبر الجسر كل يوم، يمارسون أعمالهم. كان معلماً يربط جانبي المدينة ويحمل العديد من الذكريات لأهل المنطقة.", "بنى صبي صغير بيتاً على الشجرة في شجرة القيقب العملاقة في فناء منزله الخلفي. قضى فترات بعد الظهر الصيفية في بيت الشجرة، يقرأ الكتب ويلعب الألعاب مع أصدقائه. كان مكانه السري الخاص حيث يمكنه تخيل أنه مستكشف أو قرصان. كان بيت الشجرة مكاناً للمرح والمغامرة اللامتناهية.", "كان الميناء المزدحم مليئاً بالسفن من جميع الأحجام، من قوارب الصيد الصغيرة إلى سفن الشحن العملاقة. ملأ صوت صفارات الضباب ورائحة هواء البحر الجو. كان مكاناً للنشاط والتجارة المستمرة، حيث تجلب البضائع من جميع أنحاء العالم إلى المدينة.", "رسم غروب شمس جميل السماء بظلال البرتقالي والوردي والأرجواني. اختفت الشمس ببطء تحت الأفق، تاركة وراءها توهجاً ناعماً. كانت لحظة سلام وجمال ميزت نهاية يوم آخر. كان العالم هادئاً مع بدء ظهور النجوم الأولى في السماء المظلمة.", "كانت الساعة القديمة في ساحة المدينة تكتك لأكثر من مئة عام. كانت رمزاً لتاريخ المدينة وتذكيراً مستمراً بمرور الوقت. كان الناس يتجمعون في الساحة لسماع الساعة تدق الساعة. كانت معلماً محبوباً يحتل مكانة خاصة في قلوب سكان المدينة."],
        practice: []
      }
    }
  };
Object.assign(translations.en, {
  slowerRateIntro: 'Focus on slowing down your speech by stretching vowels and taking natural pauses.',
  autoAdvance: 'Auto advance', moreItems: 'More items', lessItems: 'Fewer items', faster: 'Faster',
  speak: 'Speak', close: 'Close', chooseLetter: 'Choose a letter to start', stutter: 'Stutter', repeat: 'Repeat',
  transition: 'Transition', prepare: 'Prepare', smooth: 'Smooth', light: 'Light',
  sessionStatus: 'Session status', paused: 'Paused. Press Play to resume.', ready: 'Ready. Press Play to follow the guide.',
  running: 'Practice in progress. Press Pause whenever you need a break.', finished: 'Practice complete. You can replay or go to the next item.',
  recordingPending: 'Waiting for microphone permission…', recordingReady: 'Recording ready to play.',
  recordingHint: 'Record your practice to listen back. Audio stays on this device for this session.'
});
Object.assign(translations.ar, {
  slowerRateIntro: 'تمهّل في الكلام من خلال إطالة أصوات المد وأخذ وقفات طبيعية.',
  autoAdvance: 'انتقال تلقائي', moreItems: 'زيادة العناصر', lessItems: 'تقليل العناصر', faster: 'أسرع',
  speak: 'تكلّم', close: 'إغلاق', chooseLetter: 'اختر حرفاً للبدء', stutter: 'تأتأة', repeat: 'إعادة',
  transition: 'انتقال', prepare: 'استعداد', smooth: 'بسلاسة', light: 'تلامس خفيف',
  sessionStatus: 'حالة التدريب', paused: 'متوقف مؤقتاً. اضغط تشغيل للمتابعة.', ready: 'جاهز. اضغط تشغيل لمتابعة الدليل.',
  running: 'التدريب جارٍ. يمكنك الإيقاف المؤقت متى احتجت إلى استراحة.', finished: 'اكتمل التدريب. يمكنك الإعادة أو الانتقال إلى العنصر التالي.',
  recordingPending: 'بانتظار السماح باستخدام الميكروفون…', recordingReady: 'التسجيل جاهز للاستماع.',
  recordingHint: 'سجّل تدريبك للاستماع إليه. يبقى الصوت على هذا الجهاز خلال هذه الجلسة.'
});
Object.assign(translations.en, {
  subtitle: 'Choose a strategy to practice.', paused: 'Paused', finished: 'Done',
  pausePhase: 'Pause', repeat: 'Repeat', slower: 'Slower',
  longerPause: 'Longer pause', shorterPause: 'Shorter pause', pauseLength: 'Pause length',
  moreCycles: 'More breaths', fewerCycles: 'Fewer breaths', cycles: 'Breaths',
  lightContactIntro: 'Touch your lips or tongue together very lightly as each sound begins.',
  exhaleSpeak: 'Speak gently', exhaleSound: 'Exhale with "h"', targetWord: 'Target word'
});
Object.assign(translations.ar, {
  subtitle: 'اختر استراتيجية للتدريب.', paused: 'متوقف مؤقتاً', finished: 'اكتمل التدريب',
  pausePhase: 'وقفة', repeat: 'كرّر', slower: 'أبطأ',
  longerPause: 'وقفة أطول', shorterPause: 'وقفة أقصر', pauseLength: 'طول الوقفة',
  moreCycles: 'أنفاس أكثر', fewerCycles: 'أنفاس أقل', cycles: 'الأنفاس',
  lightContactIntro: 'المس شفتيك أو لسانك بخفة شديدة عند بدء كل صوت.',
  exhaleSpeak: 'تكلّم بلطف', exhaleSound: 'ازفر مع صوت «هـ»', targetWord: 'الكلمة المستهدفة'
});
translations.en.breathingInfo.tips.push('If you feel dizzy, stop and breathe normally.');
translations.ar.breathingInfo.tips.push('إذا شعرت بدوار، توقف وتنفس بشكل طبيعي.');
translations.en.recordingNote = 'Recordings stay on this device and are cleared when you leave the exercise.';
translations.ar.recordingNote = 'تبقى التسجيلات على هذا الجهاز وتُمسح عند مغادرة التمرين.';

Object.assign(translations.en, {
  conversation: 'Conversation', situations: 'Real situations', talk: 'Talk and use your technique',
  gateTitle: 'For parents and therapists', gateHelp: 'Solve this sum to open names and practice history.', gateRetry: 'Try again.',
  myPractice: 'My Practice', people: 'People', me: 'Me', add: 'Add', cancel: 'Cancel', addPersonLabel: 'Add a person',
  deletePerson: 'Delete', deletePersonConfirm: 'Delete {name} and all of their practice history? This cannot be undone.',
  deviceOnly: 'Names and practice history stay in this browser and are not sent anywhere. Clearing browser data removes them.',
  saveFailed: 'Practice could not be saved in this browser. It will be lost when the app closes.',
  ratingQuestion: 'How much effort did that take?', ratingEasy: 'Easy', ratingSome: 'Some effort', ratingHard: 'Hard',
  changePerson: 'Change', noPersonYet: 'No name yet', thisWeek: 'Last 7 days',
  units: { times: { one: '1 time', other: '{n} times' }, days: { one: '1 day', other: '{n} days' }, practices: { one: '1 practice', other: '{n} practices' }, breaths: { one: '1 breath', other: '{n} breaths' }, syllables: { one: '1 syllable a minute', other: '{n} syllables a minute' } },
  noPracticeThisWeek: 'No practice in the last 7 days.', notStarted: 'Not started',
  pathTitle: 'Speaking path', pathIntro: 'Move from short words toward everyday speech, at your own pace.',
  pathNote: 'Suggestions come from your own ratings: at least 5 ratings, with 70% easy. Your speech therapist can guide you differently.',
  suggestedNext: 'Suggested next', mostlyEasy: 'Mostly easy', historyTitle: 'Practice history', noHistory: 'Finished practice will appear here.',
  shareSummary: 'Share summary', shared: 'Summary copied', shareFailed: 'Could not share. Your browser blocked it.',
  summaryNote: 'Ratings are the speaker\'s own view of effort. This is a practice record, not an assessment.',
  step_words: 'Words', step_sentences: 'Sentences', step_stories: 'Reading stories', step_conversation: 'Conversation', step_situations: 'Real situations'
});
Object.assign(translations.ar, {
  conversation: 'محادثة', situations: 'مواقف حقيقية', talk: 'تحدّث واستخدم التقنية',
  gateTitle: 'للأهل والمختصين', gateHelp: 'احسب الناتج لفتح الأسماء وسجل التدريب.', gateRetry: 'حاول مرة أخرى.',
  myPractice: 'تدريبي', people: 'الأشخاص', me: 'أنا', add: 'إضافة', cancel: 'إلغاء', addPersonLabel: 'إضافة شخص',
  deletePerson: 'حذف', deletePersonConfirm: 'هل تريد حذف {name} وكل سجل تدريبه؟ لا يمكن التراجع عن ذلك.',
  deviceOnly: 'تبقى الأسماء وسجل التدريب في هذا المتصفح ولا تُرسل إلى أي جهة. مسح بيانات المتصفح يحذفها.',
  saveFailed: 'تعذر حفظ التدريب في هذا المتصفح، وسيضيع عند إغلاق التطبيق.',
  ratingQuestion: 'كم احتاج هذا من جهد؟', ratingEasy: 'سهل', ratingSome: 'بعض الجهد', ratingHard: 'صعب',
  changePerson: 'تغيير', noPersonYet: 'لا يوجد اسم بعد', thisWeek: 'آخر 7 أيام',
  units: {
    times: { one: 'مرة واحدة', two: 'مرتان', few: '{n} مرات', many: '{n} مرة', other: '{n} مرة' },
    days: { one: 'يوم واحد', two: 'يومان', few: '{n} أيام', many: '{n} يوماً', other: '{n} يوم' },
    practices: { one: 'تدريب واحد', two: 'تدريبان', few: '{n} تدريبات', many: '{n} تدريباً', other: '{n} تدريب' },
    breaths: { one: 'نفس واحد', two: 'نفسان', few: '{n} أنفاس', many: '{n} نفساً', other: '{n} نفس' },
    syllables: { few: '{n} مقاطع في الدقيقة', many: '{n} مقطعاً في الدقيقة', other: '{n} مقطع في الدقيقة' }
  },
  noPracticeThisWeek: 'لا يوجد تدريب في آخر 7 أيام.', notStarted: 'لم يبدأ',
  pathTitle: 'مسار الكلام', pathIntro: 'انتقل من الكلمات القصيرة إلى الكلام اليومي، بالسرعة التي تناسبك.',
  pathNote: 'تعتمد الاقتراحات على تقييماتك: 5 تقييمات على الأقل، 70% منها سهل. يمكن لأخصائي النطق توجيهك بشكل مختلف.',
  suggestedNext: 'الخطوة المقترحة', mostlyEasy: 'سهل غالباً', historyTitle: 'سجل التدريب', noHistory: 'سيظهر هنا التدريب المكتمل.',
  shareSummary: 'مشاركة الملخص', shared: 'تم نسخ الملخص', shareFailed: 'تعذرت المشاركة. منع المتصفح ذلك.',
  summaryNote: 'التقييمات هي رأي المتحدث في الجهد المبذول. هذا سجل تدريب وليس تقييماً.',
  step_words: 'كلمات', step_sentences: 'جمل', step_stories: 'قراءة قصص', step_conversation: 'محادثة', step_situations: 'مواقف حقيقية'
});
translations.en.practiceData.conversation = [
  'Tell someone what you did today.', 'Describe your favorite food and why you like it.', 'Talk about a place you would like to visit.',
  'Describe your home to someone who has never seen it.', 'Talk about a friend and what you enjoy doing together.', 'Explain how to make a simple drink or snack.',
  'Tell a story about a funny thing that happened to you.', 'Talk about your plans for this weekend.', 'Describe a film, show or game you like.',
  'Talk about something you are learning at the moment.', 'Describe your usual morning, from waking up onward.', 'Talk about an animal you like and what makes it special.'
];
translations.ar.practiceData.conversation = [
  'احكِ لشخص ما فعلته اليوم.', 'صف طعامك المفضل ولماذا تحبه.', 'تحدث عن مكان تود زيارته.',
  'صف بيتك لشخص لم يره من قبل.', 'تحدث عن صديق وعمّا تحبان فعله معاً.', 'اشرح طريقة تحضير مشروب أو وجبة خفيفة بسيطة.',
  'احكِ قصة عن موقف طريف حدث معك.', 'تحدث عن خططك لنهاية هذا الأسبوع.', 'صف فيلماً أو برنامجاً أو لعبة تحبها.',
  'تحدث عن شيء تتعلمه هذه الأيام.', 'صف صباحك المعتاد منذ أن تستيقظ.', 'تحدث عن حيوان تحبه وما يميزه.'
];
translations.en.practiceData.situations = [
  'Rehearse aloud, then try it for real: ask a shopkeeper how much something costs.', 'Rehearse aloud, then try it for real: say your name and greet someone new.',
  'Rehearse aloud, then try it for real: order food or a drink yourself.', 'Rehearse aloud, then try it for real: make a short phone call to a relative.',
  'Rehearse aloud, then try it for real: ask someone for directions or for help finding something.', 'Rehearse aloud, then try it for real: answer a question in class or at work.',
  'Rehearse aloud, then try it for real: tell a family member about your day at dinner.', 'Rehearse aloud, then try it for real: tell someone who knows you about your stuttering, in your own words.'
];
translations.ar.practiceData.situations = [
  'تدرّب بصوت عالٍ، ثم جرّب ذلك في الواقع: اسأل البائع عن سعر شيء ما.', 'تدرّب بصوت عالٍ، ثم جرّب ذلك في الواقع: عرّف عن اسمك وسلّم على شخص جديد.',
  'تدرّب بصوت عالٍ، ثم جرّب ذلك في الواقع: اطلب طعاماً أو مشروباً بنفسك.', 'تدرّب بصوت عالٍ، ثم جرّب ذلك في الواقع: أجرِ مكالمة قصيرة مع أحد أقاربك.',
  'تدرّب بصوت عالٍ، ثم جرّب ذلك في الواقع: اسأل شخصاً عن الطريق أو عن مكان شيء ما.', 'تدرّب بصوت عالٍ، ثم جرّب ذلك في الواقع: أجب عن سؤال في الصف أو في العمل.',
  'تدرّب بصوت عالٍ، ثم جرّب ذلك في الواقع: أخبر أحد أفراد عائلتك عن يومك على مائدة الطعام.', 'تدرّب بصوت عالٍ، ثم جرّب ذلك في الواقع: أخبر شخصاً يعرفك عن تأتأتك بكلماتك الخاصة.'
];

Object.assign(translations.en, {
  finished: 'Great try!', keepGoing: 'Keep going', stutter: 'Say it', touchPractice: 'Try it with your finger',
  hint_fluency: 'Smooth, easy talking', hint_stuttering: 'Tools for tricky words', hint_breathing: 'Calm, slow breaths', hint_progress: 'My stars and my path',
  hint_slower: 'Turtle talk', hint_onset: 'Start soft, like a breeze', hint_light: 'Touch soft, like a bubble',
  hint_cancel: 'Stop, then say it again', hint_pull: 'Slide slowly out of the word', hint_prep: 'Get ready first',
  touch_gentle: 'Slowly and gently. Try again',
  touch_bubble: 'Say the word and tap the bubble very softly', touch_softer: 'Pop! A quicker, softer tap', touch_sayIt: 'Say the word, then tap here',
  touch_holdPause: 'Press and hold while you pause', touch_keepHolding: 'Keep holding until it fills up', touch_sayAgain: 'Say it again softly, then tap here',
  touch_slide: 'Slide slowly as you ease out of the word', touch_holdReady: 'Press and hold to get ready', touch_startSoft: 'Start the word softly, then tap here'
});
Object.assign(translations.ar, {
  finished: 'أحسنت المحاولة!', keepGoing: 'تابع', stutter: 'قلها', touchPractice: 'جرّب بإصبعك',
  hint_fluency: 'كلام سهل وسلس', hint_stuttering: 'أدوات للكلمات الصعبة', hint_breathing: 'أنفاس هادئة وبطيئة', hint_progress: 'نجومي ومساري',
  hint_slower: 'كلام السلحفاة', hint_onset: 'ابدأ بنعومة مثل النسمة', hint_light: 'المس بخفة مثل الفقاعة',
  hint_cancel: 'توقف ثم قلها مرة أخرى', hint_pull: 'اخرج من الكلمة ببطء', hint_prep: 'استعد أولاً',
  touch_gentle: 'ببطء ولطف. حاول مرة أخرى',
  touch_bubble: 'قل الكلمة والمس الفقاعة بخفة شديدة', touch_softer: 'فرقعت! المسها بخفة وسرعة أكثر', touch_sayIt: 'قل الكلمة، ثم اضغط هنا',
  touch_holdPause: 'اضغط باستمرار وأنت تتوقف', touch_keepHolding: 'استمر بالضغط حتى تمتلئ', touch_sayAgain: 'قلها مرة أخرى بنعومة، ثم اضغط هنا',
  touch_slide: 'حرّك ببطء وأنت تخرج من الكلمة', touch_holdReady: 'اضغط باستمرار لتستعد', touch_startSoft: 'ابدأ الكلمة بنعومة، ثم اضغط هنا'
});

// Plain, friendly wording on the screens. The information dialogs keep the clinical detail for adults.
Object.assign(translations.en, {
  subtitle: 'What shall we practice today?', fluencyIntro: 'Smooth, easy talking, one step at a time.',
  stutteringIntro: 'Tools to help when a word gets stuck.', breathingIntro: 'Slow, calm breaths to relax your body.',
  slowerRateIntro: 'Talk slowly like a turtle and take little pauses.', easyOnsetIntro: 'Start each word with a soft breath, like a breeze.',
  lightContactIntro: 'Touch your lips or tongue very lightly, like touching a bubble.',
  cancellationIntro: 'If a word gets stuck: finish it, stop, then say it again softly.',
  pullOutIntro: 'If a word gets stuck: stay calm and slide out of it slowly.', prepSetIntro: 'Before a tricky word: get ready, then start softly.'
});
translations.en.units.stars = { one: '1 star', other: '{n} stars' };
Object.assign(translations.ar, {
  subtitle: 'ماذا نتدرب اليوم؟', fluencyIntro: 'كلام سهل وسلس، خطوة بخطوة.',
  stutteringIntro: 'أدوات تساعدك عندما تعلق الكلمة.', breathingIntro: 'أنفاس بطيئة وهادئة تريح جسمك.',
  slowerRateIntro: 'تكلّم ببطء مثل السلحفاة وخذ وقفات صغيرة.', easyOnsetIntro: 'ابدأ كل كلمة بنفس ناعم مثل النسمة.',
  lightContactIntro: 'المس شفتيك أو لسانك بخفة، كأنك تلمس فقاعة.',
  cancellationIntro: 'إذا علقت الكلمة: أكملها، توقف، ثم قلها مرة أخرى بنعومة.',
  pullOutIntro: 'إذا علقت الكلمة: ابقَ هادئاً واخرج منها ببطء.', prepSetIntro: 'قبل الكلمة الصعبة: استعد، ثم ابدأ بنعومة.'
});
translations.ar.units.stars = { one: 'نجمة واحدة', two: 'نجمتان', few: '{n} نجوم', many: '{n} نجمة', other: '{n} نجمة' };

Object.assign(translations.en, {
  tabToday: 'Today', tabTraining: 'Training', tabTools: 'Tools', dailyTraining: 'Daily training', library: 'All techniques',
  day: 'Day', minutesShort: 'min', startDay: 'Start', continueDay: 'Continue daily training', locked: 'locked', mascotBack: 'Welcome back! Ready for today?',
  lockedDay: 'Finish the days before this one to open it.', lockedStep: 'Finish the step before this one first.',
  dayDoneTitle: 'Day complete!', dayDoneText: 'You finished day {n}. See you tomorrow!', programDone: 'You finished the whole program. Be proud!',
  programDoneShort: 'Program complete', programAgain: 'Start the program again', nextStep: 'Next step', stepDone: 'Step complete!', gotIt: 'Got it', done: 'Done',
  program_lesson: 'Learn', program_affirmation: 'Kind words', program_selfRating: 'How was talking today?', program_board: 'Situation board', program_feared: 'My tricky sounds', program_tryOne: 'Try it for real',
  hint_board: 'From easy to hard', hint_feared: 'Sounds and words', hint_affirmation: 'Read it aloud', hint_selfRating: 'Today\'s rating',
  affirmRead1: 'Read it aloud: first time', affirmRead2: 'Read it aloud: second time', affirmRead3: 'Read it aloud: third time', affirmWrite: 'Now write your own', affirmPlaceholder: 'Write your kind words here…',
  boardIntro: 'Tap each situation and choose how hard it feels. You can change it any time.', tryThis: 'Try this one today', triedIt: 'I tried it!',
  level_none: 'Not sorted', level_1: 'Very easy', level_2: 'Easy', level_3: 'Medium', level_4: 'Hard', level_5: 'Very hard',
  fearedIntro: 'Choose the sounds and words that feel tricky. They become your own practice.', fearedSounds: 'Sounds', fearedWords: 'Words', fearedAdd: 'Add a word', fearedWhere: 'Your words appear under My words in the stuttering exercises.', practiceLetter: 'Practice', myWords: 'My words',
  selfQuestion: 'How was talking today?', selfNote: 'There is no wrong answer. This helps you and your speech therapist see how things change.', selfRecent: 'Recent days',
  self_1: 'Very easy', self_2: 'Easy', self_3: 'Okay', self_4: 'Hard', self_5: 'Very hard'
});
Object.assign(translations.ar, {
  tabToday: 'اليوم', tabTraining: 'البرنامج', tabTools: 'أدواتي', dailyTraining: 'التدريب اليومي', library: 'كل التقنيات',
  day: 'اليوم', minutesShort: 'د', startDay: 'ابدأ', continueDay: 'متابعة التدريب اليومي', locked: 'مقفل', mascotBack: 'أهلاً بعودتك! جاهز لليوم؟',
  lockedDay: 'أكمل الأيام السابقة لفتح هذا اليوم.', lockedStep: 'أكمل الخطوة السابقة أولاً.',
  dayDoneTitle: 'اكتمل اليوم!', dayDoneText: 'أنهيت اليوم {n}. نراك غداً!', programDone: 'أنهيت البرنامج كله. كن فخوراً بنفسك!',
  programDoneShort: 'اكتمل البرنامج', programAgain: 'ابدأ البرنامج من جديد', nextStep: 'الخطوة التالية', stepDone: 'اكتملت الخطوة!', gotIt: 'فهمت', done: 'تم',
  program_lesson: 'تعلّم', program_affirmation: 'كلمات لطيفة', program_selfRating: 'كيف كان كلامك اليوم؟', program_board: 'لوحة المواقف', program_feared: 'أصواتي الصعبة', program_tryOne: 'جرّب في الواقع',
  hint_board: 'من السهل إلى الصعب', hint_feared: 'أصوات وكلمات', hint_affirmation: 'اقرأها بصوت عالٍ', hint_selfRating: 'تقييم اليوم',
  affirmRead1: 'اقرأها بصوت عالٍ: المرة الأولى', affirmRead2: 'اقرأها بصوت عالٍ: المرة الثانية', affirmRead3: 'اقرأها بصوت عالٍ: المرة الثالثة', affirmWrite: 'الآن اكتب كلماتك', affirmPlaceholder: 'اكتب كلماتك اللطيفة هنا…',
  boardIntro: 'اضغط كل موقف واختر مدى صعوبته. يمكنك تغييره في أي وقت.', tryThis: 'جرّب هذا الموقف اليوم', triedIt: 'جرّبته!',
  level_none: 'غير مصنّف', level_1: 'سهل جداً', level_2: 'سهل', level_3: 'متوسط', level_4: 'صعب', level_5: 'صعب جداً',
  fearedIntro: 'اختر الأصوات والكلمات التي تشعر أنها صعبة، لتصبح تدريبك الخاص.', fearedSounds: 'أصوات', fearedWords: 'كلمات', fearedAdd: 'أضف كلمة', fearedWhere: 'تظهر كلماتك تحت «كلماتي» في تمارين تعديل التأتأة.', practiceLetter: 'تدرّب على', myWords: 'كلماتي',
  selfQuestion: 'كيف كان كلامك اليوم؟', selfNote: 'لا توجد إجابة خاطئة. هذا يساعدك أنت وأخصائي النطق على رؤية التغيّر.', selfRecent: 'الأيام الأخيرة',
  self_1: 'سهل جداً', self_2: 'سهل', self_3: 'عادي', self_4: 'صعب', self_5: 'صعب جداً'
});

Object.assign(translations.en, {
  opensTomorrow: 'Opens tomorrow', mascotTomorrow: 'Well done! See you tomorrow for a new day.',
  lockedTomorrow: 'Well done! This day opens tomorrow. Until then, you can repeat any finished step or practice from All techniques.',
  unlockDay: 'Open this day (for parents and therapists)', relockDay: 'Lock this day again', gateHelpDay: 'Solve this sum to open or lock this day.'
});
Object.assign(translations.ar, {
  opensTomorrow: 'يفتح غداً', mascotTomorrow: 'أحسنت! نراك غداً في يوم جديد.',
  lockedTomorrow: 'أحسنت! يفتح هذا اليوم غداً. حتى ذلك الحين، يمكنك إعادة أي خطوة أنهيتها أو التدرب من «كل التقنيات».',
  unlockDay: 'فتح هذا اليوم (للأهل والمختصين)', relockDay: 'إقفال هذا اليوم مرة أخرى', gateHelpDay: 'احسب الناتج لفتح هذا اليوم أو إقفاله.'
});

Object.assign(translations.en, {
  menu: 'Menu', menuMain: 'Main', menuMore: 'More', tabTherapist: 'Therapist',
  th_lockTitle: 'For the therapist', th_password: 'Password', th_unlock: 'Unlock', th_wrong: 'That password is not correct.',
  th_title: 'Therapy plan', th_overall: 'Overall achievement', th_goalsMet: 'Goals achieved', th_longTerm: 'Long-term goal', th_shortTerm: 'Short-term goals',
  th_allGoals: 'All goals', th_tapGoal: 'Tap a goal to see its graph.', th_chartTitle: 'Achievement over time', th_table: 'Show the numbers as a table', th_date: 'Date', th_percent: 'Achievement', th_until: 'To', th_noData: 'The graph appears after the first finished practice.',
  th_notStarted: 'Not started', th_working: 'In progress', th_achieved: 'Achieved',
  th_s: 'S · Subjective', th_o: 'O · Objective', th_a: 'A · Assessment', th_p: 'P · Plan',
  th_lastSelf: 'Latest self-rating', th_noSelf: 'No self-rating yet.', th_effort: 'Effort during practice', th_fearedSounds: 'Tricky sounds', th_fearedWords: 'Tricky words', th_easiest: 'Easiest situation', th_hardest: 'Hardest situation',
  th_total: 'Total practices', th_rate: 'Latest pace', th_tried: 'Real situations tried', th_method: 'The app records finished practice only. It does not hear speech.',
  th_best: 'Most advanced', th_least: 'Least advanced', th_easyShare: 'Practice rated easy', th_caution: 'Each percentage starts from how much was practiced, not how fluent speech is. Type your own rating for any goal.', th_setPercent: 'Your rating', th_byTherapist: 'Set by therapist', th_useCount: 'Use the practice count again',
  th_workingOn: 'Working on now', th_nothing: 'No practice in the last 7 days.', th_next: 'Suggested next goal', th_allMet: 'All goals achieved. Review new goals.', th_nextSituation: 'Next real situation', th_notes: 'Therapist notes'
});
Object.assign(translations.ar, {
  menu: 'القائمة', menuMain: 'الرئيسية', menuMore: 'المزيد', tabTherapist: 'الأخصائي',
  th_lockTitle: 'للأخصائي', th_password: 'كلمة المرور', th_unlock: 'فتح', th_wrong: 'كلمة المرور غير صحيحة.',
  th_title: 'خطة العلاج', th_overall: 'الإنجاز العام', th_goalsMet: 'الأهداف المتحققة', th_longTerm: 'الهدف طويل المدى', th_shortTerm: 'الأهداف قصيرة المدى',
  th_allGoals: 'كل الأهداف', th_tapGoal: 'اضغط هدفاً لرؤية رسمه البياني.', th_chartTitle: 'الإنجاز عبر الزمن', th_table: 'عرض الأرقام في جدول', th_date: 'التاريخ', th_percent: 'الإنجاز', th_until: 'حتى', th_noData: 'يظهر الرسم البياني بعد أول تدريب مكتمل.',
  th_notStarted: 'لم يبدأ', th_working: 'قيد العمل', th_achieved: 'تحقق',
  th_s: 'S · ذاتي', th_o: 'O · موضوعي', th_a: 'A · تقييم', th_p: 'P · خطة',
  th_lastSelf: 'آخر تقييم ذاتي', th_noSelf: 'لا يوجد تقييم ذاتي بعد.', th_effort: 'الجهد أثناء التدريب', th_fearedSounds: 'الأصوات الصعبة', th_fearedWords: 'الكلمات الصعبة', th_easiest: 'أسهل موقف', th_hardest: 'أصعب موقف',
  th_total: 'إجمالي التدريبات', th_rate: 'آخر سرعة', th_tried: 'مواقف حقيقية جُرّبت', th_method: 'يسجل التطبيق التدريب المكتمل فقط، ولا يسمع الكلام.',
  th_best: 'الأكثر تقدماً', th_least: 'الأقل تقدماً', th_easyShare: 'التدريب المقيّم سهلاً', th_caution: 'تبدأ كل نسبة من مقدار التدريب، لا من مدى طلاقة الكلام. اكتب تقييمك لأي هدف.', th_setPercent: 'تقييمك', th_byTherapist: 'حدّدها الأخصائي', th_useCount: 'العودة إلى عدد التدريبات',
  th_workingOn: 'يعمل الآن على', th_nothing: 'لا يوجد تدريب في آخر 7 أيام.', th_next: 'الهدف التالي المقترح', th_allMet: 'تحققت كل الأهداف. راجع أهدافاً جديدة.', th_nextSituation: 'الموقف الحقيقي التالي', th_notes: 'ملاحظات الأخصائي'
});

Object.assign(translations.en, {
  turtle: 'Turtle walking with the words', touch_slideStop: 'Press when the ball reaches the star', touch_early: 'Wait, it is still at the start', touch_late: 'It passed the middle. Try again', touch_sayNow: 'Now say the word softly'
});
Object.assign(translations.ar, {
  turtle: 'سلحفاة تمشي مع الكلمات', touch_slideStop: 'اضغط عندما تصل الكرة إلى النجمة', touch_early: 'انتظر، ما زالت في البداية', touch_late: 'تجاوزت الوسط. حاول مرة أخرى', touch_sayNow: 'قل الكلمة الآن بنعومة'
});

yb.createRoot(document.getElementById('root')).render(u.jsx(Y.StrictMode, { children: u.jsx(App, { translations }) }));
