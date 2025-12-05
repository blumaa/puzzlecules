-- Seed Music Connection Types
-- Categories: word-game, people, thematic, setting, cultural, narrative, character, production, elements

-- =============================================================================
-- WORD/TITLE GAMES
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Song titles with colors', 'word-game', 'Songs with color words in the title', ARRAY['Purple Rain - Prince', 'Blue Monday - New Order', 'Black Dog - Led Zeppelin', 'Yellow - Coldplay'], true, 'music'),
('Song titles with numbers', 'word-game', 'Songs with numbers in the title', ARRAY['99 Problems - Jay-Z', 'One - U2', '1999 - Prince', '7 Rings - Ariana Grande'], true, 'music'),
('Song titles as questions', 'word-game', 'Songs with titles phrased as questions', ARRAY['Where Is My Mind? - Pixies', 'What''s Going On - Marvin Gaye', 'How Soon Is Now? - The Smiths', 'Who Let the Dogs Out - Baha Men'], true, 'music'),
('One-word song titles', 'word-game', 'Songs with exactly one word in the title', ARRAY['Thriller - Michael Jackson', 'Respect - Aretha Franklin', 'Imagine - John Lennon', 'Royals - Lorde'], true, 'music'),
('Song titles with body parts', 'word-game', 'Songs with body parts in the title', ARRAY['Heart of Glass - Blondie', 'Eye of the Tiger - Survivor', 'Head Over Heels - Tears for Fears', 'Hands to Myself - Selena Gomez'], true, 'music'),
('Song titles with time words', 'word-game', 'Songs with time-related words in the title', ARRAY['Yesterday - The Beatles', 'Midnight Train to Georgia - Gladys Knight', 'Summer of ''69 - Bryan Adams', 'Forever Young - Alphaville'], true, 'music'),
('Alliterative song titles', 'word-game', 'Songs where title words start with the same letter', ARRAY['Sweet Surrender - Sarah McLachlan', 'Dirty Diana - Michael Jackson', 'Bad Blood - Taylor Swift', 'Pretty Please - Dua Lipa'], true, 'music'),
('Song titles that are names', 'word-game', 'Songs titled with a person''s name only', ARRAY['Roxanne - The Police', 'Caroline - OutKast', 'Jolene - Dolly Parton', 'Billie Jean - Michael Jackson'], true, 'music'),
('Song titles with animals', 'word-game', 'Songs with animal names in the title', ARRAY['Hound Dog - Elvis Presley', 'When Doves Cry - Prince', 'Black Dog - Led Zeppelin', 'Eye of the Tiger - Survivor'], true, 'music'),
('Song titles with places', 'word-game', 'Songs with location names in the title', ARRAY['Hotel California - Eagles', 'Africa - Toto', 'London Calling - The Clash', 'New York State of Mind - Billy Joel'], true, 'music');

-- =============================================================================
-- PEOPLE/CAREER
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs by a specific artist', 'people', 'Songs all by the same performer', ARRAY['Songs by The Beatles', 'Songs by Prince', 'Songs by Beyonce'], true, 'music'),
('Debut singles', 'people', 'First singles released by artists', ARRAY['Love Me Do - The Beatles', 'I Want You Back - Jackson 5', 'Creep - Radiohead', 'Cannonball - The Breeders'], true, 'music'),
('Final recordings', 'people', 'Last songs recorded before an artist''s death', ARRAY['Blackstar - David Bowie', 'Hurt - Johnny Cash cover', 'When the Music''s Over - The Doors'], true, 'music'),
('Grammy-winning songs', 'people', 'Songs that won Grammy Awards', ARRAY['Rolling in the Deep - Adele', 'Rehab - Amy Winehouse', 'Crazy - Gnarls Barkley', 'Bad Guy - Billie Eilish'], true, 'music'),
('Legendary collaborations', 'people', 'Famous duets or featured artist tracks', ARRAY['Under Pressure - Queen & David Bowie', 'Walk This Way - Run-DMC & Aerosmith', 'Empire State of Mind - Jay-Z & Alicia Keys'], true, 'music'),
('One-hit wonder artists', 'people', 'Artists known primarily for one song', ARRAY['Come On Eileen - Dexys Midnight Runners', 'Take On Me - a-ha', 'Tainted Love - Soft Cell', 'Video Killed the Radio Star - The Buggles'], true, 'music'),
('Supergroup songs', 'people', 'Songs by bands formed from members of other famous groups', ARRAY['Black Country Communion songs', 'Traveling Wilburys songs', 'Audioslave songs', 'Temple of the Dog songs'], true, 'music'),
('Legendary producer tracks', 'people', 'Songs known for a legendary producer''s work', ARRAY['Phil Spector productions', 'Quincy Jones productions', 'Rick Rubin productions', 'Max Martin productions'], true, 'music'),
('Songwriter crossovers', 'people', 'Songs written by artists but made famous by others', ARRAY['Nothing Compares 2 U - written by Prince', 'I Will Always Love You - written by Dolly Parton', 'Respect - written by Otis Redding'], true, 'music'),
('Breakthrough hit singles', 'people', 'Songs that launched an artist to stardom', ARRAY['...Baby One More Time - Britney Spears', 'Smells Like Teen Spirit - Nirvana', 'Crazy in Love - Beyonce'], true, 'music');

-- =============================================================================
-- THEMATIC/LYRICAL
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Protest songs', 'thematic', 'Songs with political or social messages', ARRAY['Blowin'' in the Wind - Bob Dylan', 'What''s Going On - Marvin Gaye', 'Fight the Power - Public Enemy', 'This Is America - Childish Gambino'], true, 'music'),
('Songs about partying', 'thematic', 'Songs celebrating nightlife and celebration', ARRAY['Party Rock Anthem - LMFAO', 'I Gotta Feeling - Black Eyed Peas', 'Celebration - Kool & The Gang', 'Dancing Queen - ABBA'], true, 'music'),
('Classic love songs', 'thematic', 'Romantic ballads and love declarations', ARRAY['Unchained Melody - Righteous Brothers', 'At Last - Etta James', 'Endless Love - Diana Ross & Lionel Richie'], true, 'music'),
('Songs about death and loss', 'thematic', 'Songs dealing with mortality and grief', ARRAY['Tears in Heaven - Eric Clapton', 'Gone Too Soon - Michael Jackson', 'See You Again - Wiz Khalifa', 'Knockin'' on Heaven''s Door - Bob Dylan'], true, 'music'),
('Songs about dreams', 'thematic', 'Songs exploring dreams or aspirations', ARRAY['Dream On - Aerosmith', 'I Dreamed a Dream - Les Miserables', 'California Dreamin'' - The Mamas & the Papas', 'Mr. Sandman - The Chordettes'], true, 'music'),
('Songs about rebellion', 'thematic', 'Songs about defying authority or norms', ARRAY['We''re Not Gonna Take It - Twisted Sister', 'Born to Run - Bruce Springsteen', 'Killing in the Name - Rage Against the Machine'], true, 'music'),
('Songs about fame and stardom', 'thematic', 'Songs exploring celebrity and stardom', ARRAY['Fame - David Bowie', 'Superstar - The Carpenters', 'Rockstar - Nickelback', 'Paparazzi - Lady Gaga'], true, 'music'),
('Youth anthems', 'thematic', 'Songs about youth and growing up', ARRAY['Teenage Dream - Katy Perry', 'Born to Run - Bruce Springsteen', 'We Are Young - fun.', 'Youth - Troye Sivan'], true, 'music'),
('Songs about money', 'thematic', 'Songs about wealth, poverty, or finances', ARRAY['Money - Pink Floyd', 'Bills, Bills, Bills - Destiny''s Child', 'Gold Digger - Kanye West', 'Mo Money Mo Problems - Notorious B.I.G.'], true, 'music');

-- =============================================================================
-- SETTING/STYLE
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Power ballads', 'setting', 'Emotional rock ballads with dramatic builds', ARRAY['November Rain - Guns N'' Roses', 'I Don''t Want to Miss a Thing - Aerosmith', 'Total Eclipse of the Heart - Bonnie Tyler', 'Every Rose Has Its Thorn - Poison'], true, 'music'),
('Songs under 2 minutes', 'setting', 'Short, punchy tracks', ARRAY['Blitzkrieg Bop - Ramones', 'Surfin'' Bird - The Trashmen', 'I Saw Her Standing There - The Beatles', 'Anarchy in the U.K. - Sex Pistols'], true, 'music'),
('Epic songs over 8 minutes', 'setting', 'Epic-length compositions', ARRAY['Stairway to Heaven - Led Zeppelin', 'Free Bird - Lynyrd Skynyrd', 'American Pie - Don McLean', 'Bohemian Rhapsody - Queen'], true, 'music'),
('Famous live recordings', 'setting', 'Famous live performance versions', ARRAY['Alive - Pearl Jam', 'The Song Remains the Same - Led Zeppelin', 'Frampton Comes Alive! tracks'], true, 'music'),
('Acoustic versions', 'setting', 'Stripped-down acoustic performances', ARRAY['Layla (Unplugged) - Eric Clapton', 'About a Girl (Unplugged) - Nirvana', 'Wonderwall - Oasis'], true, 'music'),
('Instrumental hits', 'setting', 'Songs without vocals', ARRAY['Classical Gas - Mason Williams', 'Frankenstein - Edgar Winter Group', 'Jessica - The Allman Brothers Band', 'Sleepwalk - Santo & Johnny'], true, 'music'),
('A cappella performances', 'setting', 'Songs performed without instruments', ARRAY['Don''t Worry Be Happy - Bobby McFerrin', 'The Lion Sleeps Tonight - The Tokens', 'Mr. Sandman - The Chordettes'], true, 'music'),
('Disco era classics', 'setting', 'Songs from the disco movement', ARRAY['Stayin'' Alive - Bee Gees', 'I Will Survive - Gloria Gaynor', 'Le Freak - Chic', 'YMCA - Village People'], true, 'music'),
('Grunge anthems', 'setting', 'Defining songs of the grunge era', ARRAY['Smells Like Teen Spirit - Nirvana', 'Black Hole Sun - Soundgarden', 'Alive - Pearl Jam', 'Would? - Alice in Chains'], true, 'music'),
('New wave hits', 'setting', 'Songs from the new wave movement', ARRAY['Blue Monday - New Order', 'Sweet Dreams - Eurythmics', 'Take On Me - a-ha', 'Whip It - Devo'], true, 'music');

-- =============================================================================
-- CULTURAL/META
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs banned from radio', 'cultural', 'Songs prohibited from airplay', ARRAY['Relax - Frankie Goes to Hollywood', 'God Save the Queen - Sex Pistols', 'Cop Killer - Body Count', 'Darling Nikki - Prince'], true, 'music'),
('Movie soundtrack hits', 'cultural', 'Songs famous from film appearances', ARRAY['Don''t You (Forget About Me) - Simple Minds', 'Eye of the Tiger - Survivor', 'My Heart Will Go On - Celine Dion', 'Stayin'' Alive - Bee Gees'], true, 'music'),
('Wedding first dance songs', 'cultural', 'Popular songs for wedding dances', ARRAY['At Last - Etta James', 'Unchained Melody - Righteous Brothers', 'Wonderful Tonight - Eric Clapton', 'A Thousand Years - Christina Perri'], true, 'music'),
('Global number one hits', 'cultural', 'Global #1 hits', ARRAY['Billie Jean - Michael Jackson', 'Shape of You - Ed Sheeran', 'Despacito - Luis Fonsi', 'Old Town Road - Lil Nas X'], true, 'music'),
('Most sampled songs ever', 'cultural', 'Songs heavily sampled by other artists', ARRAY['Amen, Brother - The Winstons', 'Funky Drummer - James Brown', 'Change the Beat - Beside', 'Impeach the President - The Honey Drippers'], true, 'music'),
('Covers that surpassed originals', 'cultural', 'Cover versions that surpassed the original', ARRAY['Hurt - Johnny Cash', 'All Along the Watchtower - Jimi Hendrix', 'Respect - Aretha Franklin', 'Tainted Love - Soft Cell'], true, 'music'),
('Internet meme songs', 'cultural', 'Songs famous from internet culture', ARRAY['Never Gonna Give You Up - Rick Astley', 'What Is Love - Haddaway', 'Gangnam Style - PSY', 'All Star - Smash Mouth'], true, 'music'),
('Iconic music videos', 'cultural', 'Songs known for groundbreaking videos', ARRAY['Thriller - Michael Jackson', 'Take On Me - a-ha', 'Sledgehammer - Peter Gabriel', 'Virtual Insanity - Jamiroquai'], true, 'music'),
('Super Bowl halftime performances', 'cultural', 'Songs performed at Super Bowl halftimes', ARRAY['Bad Romance - Lady Gaga', 'Single Ladies - Beyonce', 'Born in the U.S.A. - Bruce Springsteen'], true, 'music'),
('Songs that defined eras', 'cultural', 'Songs that defined moments in history', ARRAY['We Are the World - USA for Africa', 'Imagine - John Lennon', 'Born in the U.S.A. - Bruce Springsteen', 'Fight the Power - Public Enemy'], true, 'music');

-- =============================================================================
-- NARRATIVE STRUCTURE
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Story songs', 'narrative', 'Narrative-driven songs with clear plots', ARRAY['The Devil Went Down to Georgia - Charlie Daniels Band', 'A Boy Named Sue - Johnny Cash', 'Hurricane - Bob Dylan', 'Stan - Eminem'], true, 'music'),
('Songs with spoken word sections', 'narrative', 'Songs featuring spoken interludes', ARRAY['Paradise by the Dashboard Light - Meat Loaf', 'I Am the Walrus - The Beatles', 'Rapper''s Delight - Sugarhill Gang'], true, 'music'),
('Songs with key changes', 'narrative', 'Songs featuring modulation to new keys', ARRAY['My Heart Will Go On - Celine Dion', 'Livin'' on a Prayer - Bon Jovi', 'I Will Always Love You - Whitney Houston', 'Man in the Mirror - Michael Jackson'], true, 'music'),
('Songs that fade out', 'narrative', 'Songs with classic fade-to-silence endings', ARRAY['Hey Jude - The Beatles', 'Freebird - Lynyrd Skynyrd', 'Layla - Derek and the Dominos'], true, 'music'),
('Songs with dramatic endings', 'narrative', 'Songs with big, theatrical finishes', ARRAY['Bohemian Rhapsody - Queen', 'A Day in the Life - The Beatles', 'November Rain - Guns N'' Roses'], true, 'music'),
('Songs with false endings', 'narrative', 'Songs that seem to end then continue', ARRAY['Strawberry Fields Forever - The Beatles', 'Last Nite - The Strokes', 'The End - The Beatles'], true, 'music'),
('Medley songs', 'narrative', 'Songs combining multiple distinct sections', ARRAY['Abbey Road medley - The Beatles', 'Bohemian Rhapsody - Queen', 'Happiness Is a Warm Gun - The Beatles'], true, 'music'),
('Progressive multi-part songs', 'narrative', 'Complex songs with multiple movements', ARRAY['2112 - Rush', 'Close to the Edge - Yes', 'Supper''s Ready - Genesis', 'Shine On You Crazy Diamond - Pink Floyd'], true, 'music');

-- =============================================================================
-- CHARACTER/VOCALIST
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Female vocal powerhouses', 'character', 'Songs showcasing powerful female vocals', ARRAY['I Will Always Love You - Whitney Houston', 'Respect - Aretha Franklin', 'Rolling in the Deep - Adele', 'And I Am Telling You - Jennifer Holliday'], true, 'music'),
('Male vocal powerhouses', 'character', 'Songs showcasing powerful male vocals', ARRAY['Bohemian Rhapsody - Queen', 'Dream On - Aerosmith', 'Nessun Dorma - Luciano Pavarotti', 'Purple Rain - Prince'], true, 'music'),
('Classic duets', 'character', 'Songs performed by two artists together', ARRAY['Endless Love - Diana Ross & Lionel Richie', 'Islands in the Stream - Dolly Parton & Kenny Rogers', 'Under Pressure - Queen & David Bowie'], true, 'music'),
('Songs with group harmonies', 'character', 'Songs featuring multi-part vocal harmonies', ARRAY['Good Vibrations - Beach Boys', 'Bohemian Rhapsody - Queen', 'Africa - Toto', 'Carry On Wayward Son - Kansas'], true, 'music'),
('Falsetto vocal performances', 'character', 'Songs featuring prominent falsetto singing', ARRAY['Stayin'' Alive - Bee Gees', 'Kiss - Prince', 'Take On Me - a-ha', 'Creep - Radiohead'], true, 'music'),
('Whispered and intimate vocals', 'character', 'Songs with soft, whispered delivery', ARRAY['Wicked Game - Chris Isaak', 'Mad World - Gary Jules', 'Skinny Love - Bon Iver'], true, 'music'),
('Screamed and shouted vocals', 'character', 'Songs with intense vocal delivery', ARRAY['Won''t Get Fooled Again - The Who', 'Killing in the Name - Rage Against the Machine', 'Immigrant Song - Led Zeppelin'], true, 'music'),
('Child or youth vocalists', 'character', 'Songs featuring young singers', ARRAY['I Want You Back - Jackson 5', 'ABC - Jackson 5', 'Ben - Michael Jackson'], true, 'music');

-- =============================================================================
-- PRODUCTION
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs recorded in one take', 'production', 'Tracks captured in single recording sessions', ARRAY['Bohemian Rhapsody vocal sections - Queen', 'Hurt - Johnny Cash', 'Jolene - Dolly Parton'], true, 'music'),
('Auto-tuned vocal tracks', 'production', 'Songs using auto-tune as an effect', ARRAY['Believe - Cher', 'Buy U a Drank - T-Pain', 'Love Lockdown - Kanye West', '808s & Heartbreak tracks'], true, 'music'),
('Songs with orchestral arrangements', 'production', 'Songs featuring full orchestra backing', ARRAY['A Day in the Life - The Beatles', 'Bohemian Rhapsody - Queen', 'November Rain - Guns N'' Roses', 'Bittersweet Symphony - The Verve'], true, 'music'),
('Synthesizer-driven tracks', 'production', 'Songs built around synth sounds', ARRAY['Jump - Van Halen', 'Sweet Dreams - Eurythmics', 'Take On Me - a-ha', 'Blue Monday - New Order'], true, 'music'),
('Lo-fi recordings', 'production', 'Songs with intentionally raw production', ARRAY['Loser - Beck', 'Smells Like Teen Spirit - Nirvana', 'Debra - Beck'], true, 'music'),
('Songs in unusual time signatures', 'production', 'Songs not in standard 4/4 time', ARRAY['Money - Pink Floyd (7/4)', 'Take Five - Dave Brubeck (5/4)', 'Solsbury Hill - Peter Gabriel (7/4)'], true, 'music'),
('Wall of Sound productions', 'production', 'Songs with dense, layered production', ARRAY['Be My Baby - The Ronettes', 'River Deep - Mountain High - Ike & Tina Turner', 'Born to Run - Bruce Springsteen'], true, 'music'),
('Remixes bigger than originals', 'production', 'Remixed versions that became definitive', ARRAY['I Feel Love (12" mix) - Donna Summer', 'Blue Monday - New Order', 'Pump Up the Volume - M|A|R|R|S'], true, 'music');

-- =============================================================================
-- SPECIFIC ELEMENTS
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Iconic guitar riffs', 'elements', 'Songs known for memorable guitar parts', ARRAY['Smoke on the Water - Deep Purple', 'Sweet Child O'' Mine - Guns N'' Roses', 'Back in Black - AC/DC', 'Satisfaction - Rolling Stones'], true, 'music'),
('Prominent bass lines', 'elements', 'Songs with memorable bass parts', ARRAY['Another One Bites the Dust - Queen', 'Money - Pink Floyd', 'Under Pressure - Queen', 'Come Together - The Beatles'], true, 'music'),
('Songs with drum solos', 'elements', 'Songs featuring extended drum sections', ARRAY['In-A-Gadda-Da-Vida - Iron Butterfly', 'Moby Dick - Led Zeppelin', 'Wipe Out - The Surfaris', 'YYZ - Rush'], true, 'music'),
('Songs with hand claps', 'elements', 'Songs featuring prominent clapping', ARRAY['We Will Rock You - Queen', 'I Want You Back - Jackson 5', 'Happy - Pharrell Williams', 'Take a Walk on the Wild Side - Lou Reed'], true, 'music'),
('Songs with whistling', 'elements', 'Songs featuring whistled melodies', ARRAY['Patience - Guns N'' Roses', 'Young Folks - Peter Bjorn and John', 'Wind of Change - Scorpions', 'Walk Like an Egyptian - The Bangles'], true, 'music'),
('Songs with prominent strings', 'elements', 'Songs featuring prominent string arrangements', ARRAY['Eleanor Rigby - The Beatles', 'Kashmir - Led Zeppelin', 'Bittersweet Symphony - The Verve', 'Yesterday - The Beatles'], true, 'music'),
('Songs with horns and brass', 'elements', 'Songs featuring prominent brass sections', ARRAY['September - Earth, Wind & Fire', 'Sir Duke - Stevie Wonder', 'Pick Up the Pieces - Average White Band', 'Uptown Funk - Bruno Mars'], true, 'music'),
('Piano-driven songs', 'elements', 'Songs built around piano', ARRAY['Piano Man - Billy Joel', 'Imagine - John Lennon', 'Bohemian Rhapsody - Queen', 'Clocks - Coldplay'], true, 'music'),
('Songs starting a cappella', 'elements', 'Songs that begin with unaccompanied vocals', ARRAY['Bohemian Rhapsody - Queen', 'Black or White - Michael Jackson', 'Dream On - Aerosmith'], true, 'music'),
('Songs with iconic intros', 'elements', 'Songs known for their opening moments', ARRAY['Under Pressure - Queen', 'Smells Like Teen Spirit - Nirvana', 'Jump - Van Halen', 'Sweet Child O'' Mine - Guns N'' Roses'], true, 'music');
