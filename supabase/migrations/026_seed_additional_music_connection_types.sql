-- Additional Music Connection Types (50 new types)
-- Categories: word-game, people, thematic, setting, cultural, narrative, character, production, elements

-- =============================================================================
-- WORD/TITLE GAMES (8 new)
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Song titles with weather words', 'word-game', 'Songs with weather-related words in the title', ARRAY['Purple Rain - Prince', 'November Rain - Guns N'' Roses', 'Riders on the Storm - The Doors', 'Here Comes the Sun - The Beatles'], true, 'music'),
('Song titles with days of the week', 'word-game', 'Songs with day names in the title', ARRAY['Friday - Rebecca Black', 'Manic Monday - The Bangles', 'Sunday Bloody Sunday - U2', 'Saturday Night''s Alright - Elton John'], true, 'music'),
('Song titles with months or seasons', 'word-game', 'Songs with month or season names in the title', ARRAY['September - Earth, Wind & Fire', 'Wake Me Up When September Ends - Green Day', 'April Come She Will - Simon & Garfunkel', 'Summer Nights - Grease'], true, 'music'),
('Parenthetical song titles', 'word-game', 'Songs with parentheses in the title', ARRAY['(I Can''t Get No) Satisfaction - Rolling Stones', 'Don''t You (Forget About Me) - Simple Minds', '(Sittin'' On) The Dock of the Bay - Otis Redding', 'I Love Rock ''n'' Roll (And I Like to Boogie) - Joan Jett'], true, 'music'),
('Song titles ending in exclamation', 'word-game', 'Songs with exclamation marks in the title', ARRAY['Yeah! - Usher', 'Help! - The Beatles', 'Shout! - Tears for Fears', 'Wake Up! - Arcade Fire'], true, 'music'),
('Song titles with food or drink', 'word-game', 'Songs with food or beverage references in the title', ARRAY['American Pie - Don McLean', 'Strawberry Fields Forever - The Beatles', 'Cherry Pie - Warrant', 'Red Red Wine - UB40'], true, 'music'),
('Rhyming song titles', 'word-game', 'Songs where title words rhyme', ARRAY['Shake and Bake - fictional', 'Helter Skelter - The Beatles', 'Tutti Frutti - Little Richard', 'Oops!...I Did It Again - Britney Spears'], true, 'music'),
('Song titles that are commands', 'word-game', 'Songs with imperative titles telling you to do something', ARRAY['Don''t Stop Believin'' - Journey', 'Come Together - The Beatles', 'Stand By Me - Ben E. King', 'Let It Be - The Beatles'], true, 'music');

-- =============================================================================
-- PEOPLE/CAREER (6 new)
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Posthumous releases', 'people', 'Songs released after the artist''s death', ARRAY['Smile - Tupac', 'Free as a Bird - The Beatles', 'You Know You''re Right - Nirvana', 'Over and Over - Nate Dogg'], true, 'music'),
('Award show performance songs', 'people', 'Songs famous for award show performances', ARRAY['Purple Rain (AMA 1985) - Prince', 'Hello (Grammys 2017) - Adele', 'Shallow (Oscars 2019) - Lady Gaga & Bradley Cooper'], true, 'music'),
('Comeback hit singles', 'people', 'Songs that marked career comebacks', ARRAY['Believe - Cher', 'Sexyback - Justin Timberlake', 'Hello - Adele', 'You Oughta Know - Alanis Morissette'], true, 'music'),
('Songs from music competition shows', 'people', 'Hit songs by competition show contestants', ARRAY['A Moment Like This - Kelly Clarkson', 'Bad Romance (X Factor version)', 'Hallelujah - various covers'], true, 'music'),
('Songs by session musicians who became stars', 'people', 'Artists who started as backing players', ARRAY['Sting with The Police', 'Phil Collins with Genesis', 'Dave Grohl with Foo Fighters'], true, 'music'),
('Songs featuring uncredited guest vocals', 'people', 'Famous songs with secret collaborators', ARRAY['You''re So Vain - Carly Simon (Mick Jagger backing)', 'Young Americans - David Bowie (Luther Vandross backing)'], true, 'music');

-- =============================================================================
-- THEMATIC/LYRICAL (8 new)
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs about addiction', 'thematic', 'Songs dealing with substance abuse or addiction', ARRAY['Under the Bridge - Red Hot Chili Peppers', 'Hurt - Nine Inch Nails', 'The Needle and the Damage Done - Neil Young', 'Rehab - Amy Winehouse'], true, 'music'),
('Songs about mental health', 'thematic', 'Songs addressing mental health struggles', ARRAY['Mad World - Tears for Fears', 'Basket Case - Green Day', 'Creep - Radiohead', 'Adam''s Song - Blink-182'], true, 'music'),
('Songs about nostalgia', 'thematic', 'Songs longing for the past', ARRAY['Glory Days - Bruce Springsteen', '1985 - Bowling for Soup', 'Photograph - Nickelback', 'Summer of ''69 - Bryan Adams'], true, 'music'),
('Songs about loneliness', 'thematic', 'Songs about isolation and being alone', ARRAY['Eleanor Rigby - The Beatles', 'Boulevard of Broken Dreams - Green Day', 'I Am a Rock - Simon & Garfunkel', 'Lonely - Akon'], true, 'music'),
('Songs about war', 'thematic', 'Songs addressing war and conflict', ARRAY['War - Edwin Starr', 'Fortunate Son - Creedence Clearwater Revival', 'Zombie - The Cranberries', 'Sunday Bloody Sunday - U2'], true, 'music'),
('Songs about jealousy', 'thematic', 'Songs about envy and jealousy', ARRAY['Jealous Guy - John Lennon', 'Mr. Brightside - The Killers', 'You Belong With Me - Taylor Swift', 'Jessie''s Girl - Rick Springfield'], true, 'music'),
('Songs about running away', 'thematic', 'Songs about escape and leaving', ARRAY['Runaway - Bon Jovi', 'Born to Run - Bruce Springsteen', 'Fast Car - Tracy Chapman', 'The Great Escape - Boys Like Girls'], true, 'music'),
('Songs about cars and driving', 'thematic', 'Songs about automobiles and road trips', ARRAY['Little Red Corvette - Prince', 'Drive - The Cars', 'Mustang Sally - Wilson Pickett', 'Fast Car - Tracy Chapman'], true, 'music');

-- =============================================================================
-- SETTING/STYLE (8 new)
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Punk rock anthems', 'setting', 'Defining punk rock songs', ARRAY['Blitzkrieg Bop - Ramones', 'Anarchy in the U.K. - Sex Pistols', 'Holiday in Cambodia - Dead Kennedys', 'London Calling - The Clash'], true, 'music'),
('Motown classics', 'setting', 'Songs from the Motown era and label', ARRAY['My Girl - The Temptations', 'I Heard It Through the Grapevine - Marvin Gaye', 'Stop! In the Name of Love - The Supremes', 'Signed, Sealed, Delivered - Stevie Wonder'], true, 'music'),
('British Invasion hits', 'setting', 'Songs from the 1960s British Invasion', ARRAY['I Want to Hold Your Hand - The Beatles', 'Satisfaction - Rolling Stones', 'My Generation - The Who', 'House of the Rising Sun - The Animals'], true, 'music'),
('Hair metal anthems', 'setting', 'Songs from the 1980s glam metal era', ARRAY['Pour Some Sugar on Me - Def Leppard', 'Here I Go Again - Whitesnake', 'Cherry Pie - Warrant', 'Every Rose Has Its Thorn - Poison'], true, 'music'),
('Songs recorded at famous studios', 'setting', 'Songs recorded at legendary studios', ARRAY['Abbey Road tracks - The Beatles', 'Muscle Shoals recordings', 'Sun Studio sessions', 'Electric Lady recordings'], true, 'music'),
('MTV era defining songs', 'setting', 'Songs that defined the MTV generation', ARRAY['Video Killed the Radio Star - The Buggles', 'Thriller - Michael Jackson', 'Like a Virgin - Madonna', 'Jump - Van Halen'], true, 'music'),
('Unplugged performances', 'setting', 'Famous MTV Unplugged versions', ARRAY['Where Did You Sleep Last Night - Nirvana', 'Layla (Unplugged) - Eric Clapton', 'Killing Me Softly - Lauryn Hill', 'No Woman No Cry - Bob Marley'], true, 'music'),
('Songs from rock operas', 'setting', 'Songs from concept albums or rock operas', ARRAY['Pinball Wizard - The Who', 'The Wall songs - Pink Floyd', 'Jesus Christ Superstar tracks', 'Bohemian Rhapsody - Queen'], true, 'music');

-- =============================================================================
-- CULTURAL/META (6 new)
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('TV theme songs that became hits', 'cultural', 'Television themes that charted as singles', ARRAY['I''ll Be There for You - The Rembrandts', 'Theme from M*A*S*H', 'Happy Days theme', 'Cheers theme'], true, 'music'),
('Commercial jingle origins', 'cultural', 'Songs that started as or became commercials', ARRAY['I''d Like to Buy the World a Coke', 'Ba Da Ba Ba Ba - McDonald''s', 'Like a Rock - Chevy commercials'], true, 'music'),
('Songs used in video games', 'cultural', 'Songs famous from video game soundtracks', ARRAY['Still Alive - Portal', 'Through the Fire and Flames - Guitar Hero', 'Baba O''Riley - Rock Band', 'Simple and Clean - Kingdom Hearts'], true, 'music'),
('Songs used in sports arenas', 'cultural', 'Songs commonly played at sporting events', ARRAY['We Will Rock You - Queen', 'Kernkraft 400 - Zombie Nation', 'Seven Nation Army - The White Stripes', 'Crazy Train - Ozzy Osbourne'], true, 'music'),
('Songs censored for radio', 'cultural', 'Songs with famous radio edits', ARRAY['Forgot About Dre - Dr. Dre', 'Gold Digger - Kanye West', 'Blurred Lines - Robin Thicke', 'Get Low - Lil Jon'], true, 'music'),
('Songs with misheard lyrics', 'cultural', 'Songs famous for commonly misheard words', ARRAY['Blinded by the Light - Manfred Mann', 'Bad Moon Rising - CCR', 'Purple Haze - Jimi Hendrix', 'Bennie and the Jets - Elton John'], true, 'music');

-- =============================================================================
-- NARRATIVE STRUCTURE (4 new)
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs with counting lyrics', 'narrative', 'Songs that count numbers in the lyrics', ARRAY['One - Metallica', 'Mambo No. 5 - Lou Bega', '99 Luftballons - Nena', '50 Ways to Leave Your Lover - Paul Simon'], true, 'music'),
('Songs with call and response', 'narrative', 'Songs featuring vocal call and response', ARRAY['Shout - The Isley Brothers', 'Say It Loud - James Brown', 'Bohemian Rhapsody - Queen', 'Twist and Shout - The Beatles'], true, 'music'),
('Songs that speed up or slow down', 'narrative', 'Songs with tempo changes', ARRAY['Bohemian Rhapsody - Queen', 'Layla - Derek and the Dominos', 'A Day in the Life - The Beatles', 'Paranoid Android - Radiohead'], true, 'music'),
('Songs with surprise genre shifts', 'narrative', 'Songs that change genres mid-song', ARRAY['Bohemian Rhapsody - Queen', 'Happiness Is a Warm Gun - The Beatles', 'Paranoid Android - Radiohead', 'Band on the Run - Paul McCartney'], true, 'music');

-- =============================================================================
-- CHARACTER/VOCALIST (4 new)
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs with vocal imitations', 'character', 'Songs where vocalists imitate instruments', ARRAY['Bad - Michael Jackson (percussion sounds)', 'Scatman - Scatman John', 'I''m Blue - Eiffel 65'], true, 'music'),
('Songs with celebrity impersonation vocals', 'character', 'Songs featuring vocal impersonations', ARRAY['Weird Al parodies', 'The Presidents of the United States of America songs'], true, 'music'),
('Songs with background crowd vocals', 'character', 'Songs featuring crowd or audience singing', ARRAY['We Are the Champions - Queen', 'Hey Jude - The Beatles', 'I Wanna Be Sedated - Ramones'], true, 'music'),
('Songs with operatic vocals', 'character', 'Songs featuring opera-style singing', ARRAY['Bohemian Rhapsody - Queen', 'Music of the Night - Phantom of the Opera', 'Barcelona - Freddie Mercury & Montserrat Caballe'], true, 'music');

-- =============================================================================
-- PRODUCTION (3 new)
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs with reversed audio', 'production', 'Songs featuring backwards recordings', ARRAY['Rain - The Beatles', 'Are You Experienced? - Jimi Hendrix', 'Tomorrow Never Knows - The Beatles'], true, 'music'),
('Songs with vinyl crackle or tape hiss', 'production', 'Songs with intentional lo-fi artifacts', ARRAY['Bound 2 - Kanye West', 'Loser - Beck', 'Frontier Psychiatrist - The Avalanches'], true, 'music'),
('Songs with prominent vocoder', 'production', 'Songs using vocoder effects', ARRAY['Around the World - Daft Punk', 'Hide and Seek - Imogen Heap', 'California Love - Tupac', 'Harder Better Faster Stronger - Daft Punk'], true, 'music');

-- =============================================================================
-- SPECIFIC ELEMENTS (3 new)
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs with cowbell', 'elements', 'Songs featuring prominent cowbell', ARRAY['Don''t Fear the Reaper - Blue Oyster Cult', 'Low Rider - War', 'Honky Tonk Women - Rolling Stones', 'Mississippi Queen - Mountain'], true, 'music'),
('Songs with talk box', 'elements', 'Songs featuring talk box effects', ARRAY['Do You Feel Like We Do - Peter Frampton', 'Living for the City - Stevie Wonder', 'California Love - Tupac', 'Sweet Emotion - Aerosmith'], true, 'music'),
('Songs with wah pedal', 'elements', 'Songs featuring prominent wah-wah guitar', ARRAY['Voodoo Child - Jimi Hendrix', 'Shaft theme - Isaac Hayes', 'Enter Sandman - Metallica', 'Bulls on Parade - Rage Against the Machine'], true, 'music');
