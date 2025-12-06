-- Extended Connection Types (100 films, 100 music)
-- This migration adds comprehensive connection types for both genres

-- =============================================================================
-- FILM CONNECTION TYPES (100 new)
-- =============================================================================

-- WORD/TITLE GAMES (15 new)
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Titles with "The" prefix', 'word-game', 'Films beginning with "The"', ARRAY['The Godfather', 'The Shining', 'The Matrix', 'The Departed'], true),
('Two-word titles', 'word-game', 'Films with exactly two words in the title', ARRAY['Star Wars', 'Fight Club', 'Blade Runner', 'Pulp Fiction'], true),
('Titles with "Man" or "Woman"', 'word-game', 'Films with Man or Woman in the title', ARRAY['Spider-Man', 'Iron Man', 'Rain Man', 'Wonder Woman'], true),
('Titles starting with "A"', 'word-game', 'Films beginning with the letter A', ARRAY['Alien', 'Avatar', 'Amadeus', 'American Beauty'], true),
('Titles with punctuation', 'word-game', 'Films with colons, hyphens, or other punctuation', ARRAY['Spider-Man: No Way Home', 'Ex Machina', 'WALL-E', 'Se7en'], true),
('Titles with possessives', 'word-game', 'Films with apostrophe-s in the title', ARRAY['Schindlers List', 'Ferris Buellers Day Off', 'Logans Run', 'Rosemarys Baby'], true),
('Titles that are locations', 'word-game', 'Films named after places', ARRAY['Casablanca', 'Chinatown', 'Manhattan', 'Chicago'], true),
('Titles with "Night" or "Day"', 'word-game', 'Films with day or night references', ARRAY['A Hard Days Night', 'Night of the Living Dead', 'Day of the Dead', 'Before Sunrise'], true),
('Titles with superlatives', 'word-game', 'Films with best, worst, last, first, etc.', ARRAY['The Best Years of Our Lives', 'The Last Emperor', 'First Blood', 'The Worst Person in the World'], true),
('Titles ending in "-ing"', 'word-game', 'Films with gerund endings', ARRAY['The Shining', 'Being John Malkovich', 'Saving Private Ryan', 'Good Will Hunting'], true),
('Titles with double letters', 'word-game', 'Films with repeated letters in the title', ARRAY['Goodfellas', 'Mississippi Burning', 'Wall Street', 'Moonlight'], true),
('Titles with "Love"', 'word-game', 'Films with Love in the title', ARRAY['Love Actually', 'Shakespeare in Love', 'Crazy Stupid Love', 'Love Story'], true),
('Titles with "Dead" or "Death"', 'word-game', 'Films referencing death in the title', ARRAY['Dead Poets Society', 'Death Becomes Her', 'The Dead Zone', 'Sudden Death'], true),
('Titles with cardinal directions', 'word-game', 'Films with North, South, East, or West', ARRAY['North by Northwest', 'True West', 'East of Eden', 'South Pacific'], true),
('Titles with "Black" or "White"', 'word-game', 'Films with Black or White in the title', ARRAY['Black Panther', 'Men in Black', 'The White Ribbon', 'Black Swan'], true) ON CONFLICT (name) DO NOTHING;

-- PEOPLE/CAREER (15 new)
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Films with actor/director pairs', 'people', 'Recurring actor-director collaborations', ARRAY['Scorsese/De Niro films', 'Burton/Depp films', 'Nolan/Caine films', 'Anderson/Murray films'], true),
('Posthumous releases', 'people', 'Films released after stars death', ARRAY['The Dark Knight (Ledger)', 'Gladiator (Reed)', 'The Crow (Lee)', 'Fast & Furious 7 (Walker)'], true),
('Method acting performances', 'people', 'Films with famous method acting', ARRAY['Raging Bull', 'The Revenant', 'Dallas Buyers Club', 'Monster'], true),
('Career-defining roles', 'people', 'Films that defined an actors persona', ARRAY['Dirty Harry (Eastwood)', 'Die Hard (Willis)', 'Terminator (Schwarzenegger)', 'Rocky (Stallone)'], true),
('Actors playing real people', 'people', 'Biographical performances', ARRAY['Walk the Line', 'Ray', 'The Theory of Everything', 'Bohemian Rhapsody'], true),
('Multiple Oscar nominees in cast', 'people', 'Films with 3+ Oscar-nominated actors', ARRAY['The Departed', 'Silver Linings Playbook', 'American Hustle', 'The Big Short'], true),
('Director cameos', 'people', 'Films where directors appear on screen', ARRAY['Hitchcock films', 'Tarantino films', 'M. Night Shyamalan films', 'Peter Jackson films'], true),
('Actors against type', 'people', 'Dramatic actors in comedies or vice versa', ARRAY['Punch-Drunk Love (Sandler)', 'The Truman Show (Carrey)', 'Lost in Translation (Murray)', 'Eternal Sunshine (Carrey)'], true),
('Family acting dynasties', 'people', 'Films featuring acting family members', ARRAY['The Royal Tenenbaums', 'On Golden Pond', 'It Runs in the Family', 'House of Gucci'], true),
('Stunt performer highlights', 'people', 'Films known for stunt work', ARRAY['Mad Max: Fury Road', 'Mission: Impossible series', 'John Wick series', 'The Raid'], true),
('Makeup transformation roles', 'people', 'Films with heavy prosthetic makeup', ARRAY['The Elephant Man', 'Mrs. Doubtfire', 'The Iron Lady', 'Darkest Hour'], true),
('Voice acting legends', 'people', 'Animated films with iconic voice performances', ARRAY['The Lion King', 'Shrek', 'Toy Story', 'The Incredibles'], true),
('Actors playing villains after hero roles', 'people', 'Good guys turned bad', ARRAY['No Country for Old Men (Bardem)', 'There Will Be Blood (Day-Lewis)', 'Nightcrawler (Gyllenhaal)'], true),
('Real couples on screen', 'people', 'Films starring real-life couples', ARRAY['Eyes Wide Shut', 'Mr. & Mrs. Smith', 'The Vow', 'Gigli'], true),
('Actors who directed themselves', 'people', 'Actor-directors in their own films', ARRAY['Braveheart', 'Dances with Wolves', 'The Passion of the Christ', 'Argo'], true) ON CONFLICT (name) DO NOTHING;

-- THEMATIC/PLOT (20 new)
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Conspiracy thriller plots', 'thematic', 'Films about uncovering conspiracies', ARRAY['All the Presidents Men', 'The Manchurian Candidate', 'Three Days of the Condor', 'Enemy of the State'], true),
('Wrongfully accused protagonists', 'thematic', 'Films about proving innocence', ARRAY['The Fugitive', 'North by Northwest', 'The Shawshank Redemption', 'In the Name of the Father'], true),
('Survival stories', 'thematic', 'Films about staying alive against odds', ARRAY['127 Hours', 'Cast Away', 'The Revenant', 'Life of Pi'], true),
('Courtroom dramas', 'thematic', 'Films centered on legal proceedings', ARRAY['12 Angry Men', 'A Few Good Men', 'To Kill a Mockingbird', 'The Verdict'], true),
('Sports underdog stories', 'thematic', 'Films about unlikely athletic triumph', ARRAY['Rocky', 'Rudy', 'Hoosiers', 'Remember the Titans'], true),
('Prison escape films', 'thematic', 'Films about breaking out of captivity', ARRAY['The Shawshank Redemption', 'The Great Escape', 'Escape from Alcatraz', 'Papillon'], true),
('Doppelganger/identity swap plots', 'thematic', 'Films about doubles or switched identities', ARRAY['The Prince and the Pauper', 'Face/Off', 'The Prestige', 'Us'], true),
('Apocalyptic/post-apocalyptic settings', 'thematic', 'Films about the end of civilization', ARRAY['Mad Max', 'The Road', 'Children of Men', 'I Am Legend'], true),
('Haunted house stories', 'thematic', 'Films about supernatural dwellings', ARRAY['The Shining', 'Poltergeist', 'The Conjuring', 'The Others'], true),
('Corporate corruption exposes', 'thematic', 'Films about business malfeasance', ARRAY['The Insider', 'Erin Brockovich', 'Michael Clayton', 'The Big Short'], true),
('Love triangles', 'thematic', 'Films with three-way romantic tension', ARRAY['Casablanca', 'The English Patient', 'Pearl Harbor', 'Twilight'], true),
('Forbidden love stories', 'thematic', 'Films about socially unacceptable romance', ARRAY['Romeo + Juliet', 'Brokeback Mountain', 'The Shape of Water', 'Call Me by Your Name'], true),
('Found footage narratives', 'thematic', 'Films presented as discovered recordings', ARRAY['The Blair Witch Project', 'Paranormal Activity', 'Cloverfield', 'REC'], true),
('Anthology films', 'thematic', 'Films with multiple separate stories', ARRAY['Pulp Fiction', 'Sin City', 'Wild Tales', 'Paris, je taime'], true),
('Rags to riches stories', 'thematic', 'Films about achieving wealth from poverty', ARRAY['The Pursuit of Happyness', 'Slumdog Millionaire', 'The Great Gatsby', 'Trading Places'], true),
('Mind-bending reality films', 'thematic', 'Films questioning what is real', ARRAY['Inception', 'The Matrix', 'Donnie Darko', 'Mulholland Drive'], true),
('Mentor-student relationships', 'thematic', 'Films about teaching and learning', ARRAY['Good Will Hunting', 'The Karate Kid', 'Whiplash', 'Dead Poets Society'], true),
('Sibling rivalry stories', 'thematic', 'Films about competing brothers/sisters', ARRAY['The Godfather', 'Rain Man', 'What Ever Happened to Baby Jane?', 'Warrior'], true),
('Environmental disaster films', 'thematic', 'Films about ecological catastrophe', ARRAY['The Day After Tomorrow', 'Twister', 'Volcano', 'Dante''s Peak'], true),
('Parallel storylines', 'thematic', 'Films with simultaneous plot threads', ARRAY['Babel', 'Traffic', 'Crash', '21 Grams'], true) ON CONFLICT (name) DO NOTHING;

-- SETTING/VISUAL (15 new)
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Films set in Los Angeles', 'setting', 'Films primarily in LA', ARRAY['Chinatown', 'La La Land', 'Mulholland Drive', 'Collateral'], true),
('Films set in London', 'setting', 'Films primarily in London', ARRAY['Notting Hill', 'Lock Stock and Two Smoking Barrels', 'A Clockwork Orange', 'Mary Poppins'], true),
('Films set in Chicago', 'setting', 'Films primarily in Chicago', ARRAY['The Dark Knight', 'Ferris Buellers Day Off', 'The Untouchables', 'High Fidelity'], true),
('Films set during World War II', 'setting', 'WWII-era settings', ARRAY['Saving Private Ryan', 'Schindlers List', 'Inglourious Basterds', 'Dunkirk'], true),
('Films set in the 1950s', 'setting', 'Films taking place in the fifties', ARRAY['Grease', 'Back to the Future', 'Pleasantville', 'Far from Heaven'], true),
('Films set in the 1980s', 'setting', 'Films taking place in the eighties', ARRAY['Stranger Things era films', 'The Wedding Singer', 'Donnie Darko', 'Adventureland'], true),
('Desert settings', 'setting', 'Films taking place in arid landscapes', ARRAY['Lawrence of Arabia', 'Mad Max: Fury Road', 'Dune', 'The English Patient'], true),
('Snowy/winter settings', 'setting', 'Films in cold, snowy environments', ARRAY['Fargo', 'The Shining', 'The Revenant', 'The Hateful Eight'], true),
('Island settings', 'setting', 'Films taking place on islands', ARRAY['Cast Away', 'Jurassic Park', 'Shutter Island', 'The Beach'], true),
('Submarine films', 'setting', 'Films set in submarines', ARRAY['Das Boot', 'The Hunt for Red October', 'Crimson Tide', 'U-571'], true),
('Airport/airplane settings', 'setting', 'Films primarily on planes or in airports', ARRAY['Airport', 'Die Hard 2', 'The Terminal', 'Snakes on a Plane'], true),
('Hospital settings', 'setting', 'Films primarily in medical facilities', ARRAY['The Exorcist III', 'One Flew Over the Cuckoos Nest', 'Awakenings', 'Patch Adams'], true),
('Mansion/estate settings', 'setting', 'Films in grand houses', ARRAY['Citizen Kane', 'Rebecca', 'Knives Out', 'Gosford Park'], true),
('Casino settings', 'setting', 'Films in gambling establishments', ARRAY['Casino', 'Oceans Eleven', 'Rounders', 'The Hangover'], true),
('Cruise ship settings', 'setting', 'Films on ocean liners', ARRAY['Titanic', 'The Poseidon Adventure', 'Dead Calm', 'Speed 2'], true) ON CONFLICT (name) DO NOTHING;

-- CULTURAL/META (10 new)
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Cannes Palme dOr winners', 'cultural', 'Films winning Cannes top prize', ARRAY['Pulp Fiction', 'Parasite', 'The Piano', 'Apocalypse Now'], true),
('AFI Top 100 films', 'cultural', 'Films on the American Film Institute list', ARRAY['Citizen Kane', 'Casablanca', 'The Godfather', 'Singin in the Rain'], true),
('Based on stage plays', 'cultural', 'Films adapted from theater', ARRAY['12 Angry Men', 'Glengarry Glen Ross', 'Fences', 'August: Osage County'], true),
('Based on comic books/graphic novels', 'cultural', 'Films from comic sources', ARRAY['The Dark Knight', 'V for Vendetta', 'Sin City', 'Road to Perdition'], true),
('Based on novels', 'cultural', 'Films adapted from books', ARRAY['The Godfather', 'To Kill a Mockingbird', 'No Country for Old Men', 'The Shining'], true),
('Spawned TV series', 'cultural', 'Films that became television shows', ARRAY['MASH', 'Fargo', 'Westworld', 'The Terminator'], true),
('Films that influenced fashion', 'cultural', 'Films with iconic costume design', ARRAY['Breakfast at Tiffanys', 'Saturday Night Fever', 'The Great Gatsby', 'Clueless'], true),
('Product placement controversies', 'cultural', 'Films known for heavy advertising', ARRAY['E.T.', 'Cast Away', 'The Italian Job', 'Transformers'], true),
('Films with famous bloopers', 'cultural', 'Films known for on-screen mistakes', ARRAY['Gladiator', 'Braveheart', 'Pirates of the Caribbean', 'Harry Potter series'], true),
('Holiday classic films', 'cultural', 'Films associated with holidays', ARRAY['Its a Wonderful Life', 'A Christmas Story', 'Home Alone', 'Elf'], true) ON CONFLICT (name) DO NOTHING;

-- NARRATIVE STRUCTURE (10 new)
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Real-time narratives', 'narrative', 'Films where runtime equals story time', ARRAY['High Noon', '12 Angry Men', 'Phone Booth', 'Victoria'], true),
('Flashback-heavy narratives', 'narrative', 'Films told primarily through flashbacks', ARRAY['Citizen Kane', 'The Usual Suspects', 'Forrest Gump', 'Titanic'], true),
('Voiceover narration', 'narrative', 'Films with extensive narration', ARRAY['Goodfellas', 'The Shawshank Redemption', 'Fight Club', 'A Christmas Story'], true),
('Epistolary narratives', 'narrative', 'Films told through letters/messages', ARRAY['The Notebook', 'You''ve Got Mail', '84 Charing Cross Road', 'Griffin and Phoenix'], true),
('Documentary style fiction', 'narrative', 'Fictional films made like documentaries', ARRAY['This Is Spinal Tap', 'The Office (UK film)', 'Best in Show', 'Borat'], true),
('Films with twist villains', 'narrative', 'Films with surprise antagonist reveals', ARRAY['The Usual Suspects', 'Primal Fear', 'The Sixth Sense', 'Frozen'], true),
('It was all a dream plots', 'narrative', 'Films with dream-based reveals', ARRAY['The Wizard of Oz', 'Mulholland Drive', 'Vanilla Sky', 'Total Recall'], true),
('Protagonist dies in the end', 'narrative', 'Films where the hero perishes', ARRAY['Gladiator', 'Braveheart', 'American Beauty', 'Thelma & Louise'], true),
('Films ending with weddings', 'narrative', 'Films culminating in marriage', ARRAY['The Graduate', 'My Best Friends Wedding', 'Four Weddings and a Funeral', 'The Princess Bride'], true),
('Open-ended conclusions', 'narrative', 'Films with unresolved endings', ARRAY['Inception', 'The Thing', 'No Country for Old Men', 'Lost in Translation'], true) ON CONFLICT (name) DO NOTHING;

-- CHARACTER ARCHETYPES (10 new)
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Genius protagonists', 'character', 'Films with exceptionally intelligent leads', ARRAY['A Beautiful Mind', 'Good Will Hunting', 'The Imitation Game', 'Limitless'], true),
('Criminal mastermind protagonists', 'character', 'Films following brilliant criminals', ARRAY['Oceans Eleven', 'The Italian Job', 'Catch Me If You Can', 'Inside Man'], true),
('Reluctant heroes', 'character', 'Protagonists forced into heroism', ARRAY['Die Hard', 'The Matrix', 'Star Wars', 'Mad Max'], true),
('Tragic heroes', 'character', 'Protagonists with fatal flaws', ARRAY['Citizen Kane', 'There Will Be Blood', 'The Godfather', 'Scarface'], true),
('Femme fatale characters', 'character', 'Films featuring dangerous women', ARRAY['Double Indemnity', 'Basic Instinct', 'Gone Girl', 'Fatal Attraction'], true),
('Everyman protagonists', 'character', 'Ordinary people in extraordinary situations', ARRAY['North by Northwest', 'The Truman Show', 'Office Space', 'Falling Down'], true),
('Chosen one narratives', 'character', 'Protagonists with special destinies', ARRAY['The Matrix', 'Harry Potter', 'Star Wars', 'Dune'], true),
('Partners in crime', 'character', 'Criminal duos', ARRAY['Bonnie and Clyde', 'Thelma & Louise', 'Butch Cassidy and the Sundance Kid', 'Natural Born Killers'], true),
('Fish out of water cops', 'character', 'Police in unfamiliar environments', ARRAY['Beverly Hills Cop', 'Witness', 'Hot Fuzz', 'In the Heat of the Night'], true),
('Lovable loser protagonists', 'character', 'Sympathetic underachievers', ARRAY['The Big Lebowski', 'Napoleon Dynamite', 'Office Space', 'Clerks'], true) ON CONFLICT (name) DO NOTHING;

-- PRODUCTION (5 new)
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Single-take sequences', 'production', 'Films with famous long takes', ARRAY['1917', 'Birdman', 'Children of Men', 'Goodfellas'], true),
('Stop-motion animation', 'production', 'Films using stop-motion techniques', ARRAY['The Nightmare Before Christmas', 'Coraline', 'Fantastic Mr. Fox', 'Kubo and the Two Strings'], true),
('Rotoscope animation', 'production', 'Films using rotoscoping', ARRAY['A Scanner Darkly', 'Waking Life', 'The Lord of the Rings (1978)', 'Loving Vincent'], true),
('Films shot on location vs soundstage', 'production', 'Location-heavy productions', ARRAY['Lawrence of Arabia', 'The Revenant', 'Mad Max: Fury Road', 'Apocalypse Now'], true),
('IMAX-formatted films', 'production', 'Films shot in or formatted for IMAX', ARRAY['The Dark Knight', 'Dunkirk', 'Interstellar', 'Dune'], true) ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- MUSIC CONNECTION TYPES (100 new)
-- =============================================================================

-- WORD/TITLE GAMES (15 new)
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Song titles with "Baby"', 'word-game', 'Songs with Baby in the title', ARRAY['Baby One More Time - Britney Spears', 'Ice Ice Baby - Vanilla Ice', 'Baby - Justin Bieber', 'Always Be My Baby - Mariah Carey'], true, 'music'),
('Song titles with "Heart"', 'word-game', 'Songs with Heart in the title', ARRAY['Heart of Glass - Blondie', 'Total Eclipse of the Heart - Bonnie Tyler', 'Heartbreaker - Pat Benatar', 'Unbreak My Heart - Toni Braxton'], true, 'music'),
('Song titles with "Fire"', 'word-game', 'Songs with Fire in the title', ARRAY['Ring of Fire - Johnny Cash', 'Great Balls of Fire - Jerry Lee Lewis', 'Light My Fire - The Doors', 'Fire - Jimi Hendrix'], true, 'music'),
('Song titles with "Night" or "Day"', 'word-game', 'Songs with time of day references', ARRAY['A Hard Days Night - The Beatles', 'Night Fever - Bee Gees', 'Day-O - Harry Belafonte', 'Saturday Night - Bay City Rollers'], true, 'music'),
('Song titles with "Girl" or "Boy"', 'word-game', 'Songs with gender references', ARRAY['Material Girl - Madonna', 'Jessies Girl - Rick Springfield', 'Boys Dont Cry - The Cure', 'Barbie Girl - Aqua'], true, 'music'),
('Song titles with "Home"', 'word-game', 'Songs with Home in the title', ARRAY['Sweet Home Alabama - Lynyrd Skynyrd', 'Take Me Home, Country Roads - John Denver', 'Home - Phillip Phillips', 'Homeward Bound - Simon & Garfunkel'], true, 'music'),
('Song titles with "Dance" or "Dancing"', 'word-game', 'Songs about dancing', ARRAY['Dancing Queen - ABBA', 'Safety Dance - Men at Work', 'Dance With Somebody - Whitney Houston', 'Lets Dance - David Bowie'], true, 'music'),
('Song titles with "Sun" or "Moon"', 'word-game', 'Songs with celestial bodies', ARRAY['Here Comes the Sun - The Beatles', 'Walking on Sunshine - Katrina and the Waves', 'Bad Moon Rising - CCR', 'Moonlight Sonata - Beethoven'], true, 'music'),
('Song titles with "Crazy"', 'word-game', 'Songs with Crazy in the title', ARRAY['Crazy - Patsy Cline', 'Crazy in Love - Beyonce', 'Crazy Little Thing Called Love - Queen', 'Crazy Train - Ozzy Osbourne'], true, 'music'),
('Song titles as statements', 'word-game', 'Songs that make declarations', ARRAY['I Will Survive - Gloria Gaynor', 'I Want to Break Free - Queen', 'I Love Rock n Roll - Joan Jett', 'We Are the Champions - Queen'], true, 'music'),
('Song titles with profanity', 'word-game', 'Songs with explicit titles', ARRAY['F**k tha Police - N.W.A.', 'Bulls*** - The Rolling Stones', 'Shut the F**k Up - Pink', 'What the F**k - various'], true, 'music'),
('Song titles with "Sweet"', 'word-game', 'Songs with Sweet in the title', ARRAY['Sweet Child O Mine - Guns N Roses', 'Sweet Caroline - Neil Diamond', 'Sweet Dreams - Eurythmics', 'Sweet Home Alabama - Lynyrd Skynyrd'], true, 'music'),
('Song titles with "Rock"', 'word-game', 'Songs with Rock in the title', ARRAY['We Will Rock You - Queen', 'Rock and Roll All Nite - KISS', 'I Love Rock n Roll - Joan Jett', 'Rock Around the Clock - Bill Haley'], true, 'music'),
('Alliterative band names', 'word-game', 'Bands with alliterative names', ARRAY['Duran Duran songs', 'Talking Heads songs', 'Smashing Pumpkins songs', 'Matchbox Twenty songs'], true, 'music'),
('Songs with onomatopoeia titles', 'word-game', 'Songs with sound-effect titles', ARRAY['Boom Boom Pow - Black Eyed Peas', 'Tick Tock - Kesha', 'Mmmbop - Hanson', 'Da Da Da - Trio'], true, 'music') ON CONFLICT (name) DO NOTHING;

-- PEOPLE/CAREER (15 new)
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs by child stars', 'people', 'Songs by artists who started young', ARRAY['Jackson 5 songs', 'Stevie Wonder early songs', 'Britney Spears debut', 'Justin Bieber early songs'], true, 'music'),
('Songs by siblings', 'people', 'Songs by brother/sister acts', ARRAY['Bee Gees songs', 'The Carpenters songs', 'Oasis songs', 'Kings of Leon songs'], true, 'music'),
('Songs by married couples', 'people', 'Songs by romantic partner duos', ARRAY['Sonny & Cher songs', 'Ike & Tina Turner songs', 'The White Stripes songs', 'She & Him songs'], true, 'music'),
('Songs by solo artists from famous bands', 'people', 'Post-band solo careers', ARRAY['Phil Collins solo', 'Sting solo', 'Peter Gabriel solo', 'Ozzy Osbourne solo'], true, 'music'),
('Songs that samples other songs', 'people', 'Songs built on previous recordings', ARRAY['Ice Ice Baby - Vanilla Ice', 'Cant Touch This - MC Hammer', 'Bitter Sweet Symphony - The Verve', 'Crazy in Love - Beyonce'], true, 'music'),
('Songs by one-name artists', 'people', 'Songs by mononymous performers', ARRAY['Prince songs', 'Madonna songs', 'Cher songs', 'Adele songs'], true, 'music'),
('Songs by artists who died young', 'people', 'Songs by artists who died before 30', ARRAY['Jimi Hendrix songs', 'Janis Joplin songs', 'Kurt Cobain songs', 'Amy Winehouse songs'], true, 'music'),
('Songs by self-taught musicians', 'people', 'Songs by non-formally trained artists', ARRAY['Jimi Hendrix songs', 'Eric Clapton songs', 'Dave Grohl songs', 'Prince songs'], true, 'music'),
('Songs covered by American Idol contestants', 'people', 'Common AI audition songs', ARRAY['I Will Always Love You', 'Hallelujah', 'Unchained Melody', 'At Last'], true, 'music'),
('Songs that launched record labels', 'people', 'First hits for indie labels', ARRAY['My Generation - The Who (Reaction)', 'Love Buzz - Nirvana (Sub Pop)', 'She Loves You - Beatles (Parlophone)'], true, 'music'),
('Songs by artists who changed genres', 'people', 'Artists who switched musical styles', ARRAY['Taylor Swift country to pop', 'Kid Rock rap to rock', 'Bon Jovi rock to country', 'Darius Rucker rock to country'], true, 'music'),
('Songs featuring famous guest rappers', 'people', 'Pop songs with rap features', ARRAY['Crazy in Love (Jay-Z)', 'Umbrella (Jay-Z)', 'My Love (T.I.)', 'Love the Way You Lie (Eminem)'], true, 'music'),
('Songs by artists over 60', 'people', 'Songs by veteran performers', ARRAY['I Still Havent Found What Im Looking For - U2', 'Satisfaction - Rolling Stones (tours)', 'My Way - Frank Sinatra', 'Johnny B. Goode - Chuck Berry (late)'], true, 'music'),
('Songs by multi-instrumentalists', 'people', 'Songs by artists who play many instruments', ARRAY['Prince songs', 'Stevie Wonder songs', 'Paul McCartney songs', 'Dave Grohl songs'], true, 'music'),
('Songs by former session musicians', 'people', 'Songs by artists who were backup players', ARRAY['Toto songs', 'Steely Dan songs', 'Glen Campbell songs', 'Joe Cocker songs'], true, 'music') ON CONFLICT (name) DO NOTHING;

-- THEMATIC/LYRICAL (20 new)
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs about dancing', 'thematic', 'Songs celebrating dance', ARRAY['Footloose - Kenny Loggins', 'I Wanna Dance with Somebody - Whitney Houston', 'Lets Dance - David Bowie', 'Dancing in the Dark - Bruce Springsteen'], true, 'music'),
('Songs about specific cities', 'thematic', 'Songs naming cities', ARRAY['New York, New York - Frank Sinatra', 'Chicago - Frank Sinatra', 'London Calling - The Clash', 'Sweet Home Alabama - Lynyrd Skynyrd'], true, 'music'),
('Songs about heartbreak', 'thematic', 'Songs about romantic pain', ARRAY['I Will Always Love You - Whitney Houston', 'Nothing Compares 2 U - Sinead OConnor', 'Someone Like You - Adele', 'Tears in Heaven - Eric Clapton'], true, 'music'),
('Songs about empowerment', 'thematic', 'Songs about self-confidence', ARRAY['Roar - Katy Perry', 'Stronger - Kelly Clarkson', 'Fight Song - Rachel Platten', 'Born This Way - Lady Gaga'], true, 'music'),
('Songs about friendship', 'thematic', 'Songs celebrating friends', ARRAY['Lean on Me - Bill Withers', 'Youve Got a Friend - Carole King', 'Ill Be There for You - The Rembrandts', 'Count on Me - Bruno Mars'], true, 'music'),
('Songs about being young', 'thematic', 'Songs about youth', ARRAY['Young Americans - David Bowie', 'Forever Young - Rod Stewart', 'Kids - MGMT', 'We Are Young - fun.'], true, 'music'),
('Songs about working/jobs', 'thematic', 'Songs about employment', ARRAY['9 to 5 - Dolly Parton', 'Working for the Weekend - Loverboy', 'Take This Job and Shove It - Johnny Paycheck', 'She Works Hard for the Money - Donna Summer'], true, 'music'),
('Songs about the weekend', 'thematic', 'Songs about Saturday/Sunday', ARRAY['Saturday Night Fever - Bee Gees', 'Manic Monday - The Bangles', 'Friday - Rebecca Black', 'Weekends This Is What the Weekend Meant For - Loverboy'], true, 'music'),
('Songs about mothers', 'thematic', 'Songs about maternal figures', ARRAY['Mama - Genesis', 'Dear Mama - Tupac', 'Mother - Pink Floyd', 'Hey Mama - Kanye West'], true, 'music'),
('Songs about fathers', 'thematic', 'Songs about paternal figures', ARRAY['Cats in the Cradle - Harry Chapin', 'Father and Son - Cat Stevens', 'Dance with My Father - Luther Vandross', 'Papa Was a Rollin Stone - The Temptations'], true, 'music'),
('Songs about school', 'thematic', 'Songs about education', ARRAY['School''s Out - Alice Cooper', 'We Dont Need No Education - Pink Floyd', 'Hot for Teacher - Van Halen', 'Rock n Roll High School - Ramones'], true, 'music'),
('Songs about California', 'thematic', 'Songs referencing California', ARRAY['California Dreamin - Mamas and Papas', 'Hotel California - Eagles', 'California Gurls - Katy Perry', 'Going to California - Led Zeppelin'], true, 'music'),
('Songs about heaven/angels', 'thematic', 'Songs with heavenly imagery', ARRAY['Stairway to Heaven - Led Zeppelin', 'Knockin on Heavens Door - Bob Dylan', 'Angel - Sarah McLachlan', 'Heaven - Bryan Adams'], true, 'music'),
('Songs about freedom', 'thematic', 'Songs celebrating liberty', ARRAY['Born Free - Kid Rock', 'Free Bird - Lynyrd Skynyrd', 'I Want to Break Free - Queen', 'Freedom - George Michael'], true, 'music'),
('Songs about rain', 'thematic', 'Songs about precipitation', ARRAY['Purple Rain - Prince', 'November Rain - Guns N Roses', 'Singing in the Rain - Gene Kelly', 'Its Raining Men - The Weather Girls'], true, 'music'),
('Songs about telephones', 'thematic', 'Songs about phone calls', ARRAY['Call Me - Blondie', 'Telephone - Lady Gaga', 'Hotline Bling - Drake', 'Hanging on the Telephone - Blondie'], true, 'music'),
('Songs about waiting', 'thematic', 'Songs about anticipation', ARRAY['Waiting for a Girl Like You - Foreigner', 'The Waiting - Tom Petty', 'Right Here Waiting - Richard Marx', 'Wait - White Lion'], true, 'music'),
('Songs about crying', 'thematic', 'Songs about tears', ARRAY['Cry Me a River - Justin Timberlake', 'Dont Cry - Guns N Roses', 'Boys Dont Cry - The Cure', 'Big Girls Dont Cry - Fergie'], true, 'music'),
('Songs about secrets', 'thematic', 'Songs about hidden truths', ARRAY['Secret - Madonna', 'The Secret Garden - Bruce Springsteen', 'Dirty Little Secret - All-American Rejects', 'Secret Lover - Atlantic Starr'], true, 'music'),
('Songs about flying', 'thematic', 'Songs about flight', ARRAY['Learning to Fly - Tom Petty', 'Fly Away - Lenny Kravitz', 'I Believe I Can Fly - R. Kelly', 'Free Fallin - Tom Petty'], true, 'music') ON CONFLICT (name) DO NOTHING;

-- SETTING/STYLE (15 new)
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Grunge anthems', 'setting', 'Defining Seattle grunge songs', ARRAY['Smells Like Teen Spirit - Nirvana', 'Black Hole Sun - Soundgarden', 'Jeremy - Pearl Jam', 'Man in the Box - Alice in Chains'], true, 'music'),
('New Wave classics', 'setting', 'Defining 80s New Wave songs', ARRAY['Take On Me - a-ha', 'Sweet Dreams - Eurythmics', 'Just Cant Get Enough - Depeche Mode', 'Blue Monday - New Order'], true, 'music'),
('Disco era hits', 'setting', 'Classic 70s disco songs', ARRAY['Stayin Alive - Bee Gees', 'I Will Survive - Gloria Gaynor', 'Le Freak - Chic', 'Boogie Wonderland - Earth, Wind & Fire'], true, 'music'),
('Psychedelic 60s songs', 'setting', 'Psychedelic rock classics', ARRAY['Purple Haze - Jimi Hendrix', 'White Rabbit - Jefferson Airplane', 'Lucy in the Sky with Diamonds - Beatles', 'Incense and Peppermints - Strawberry Alarm Clock'], true, 'music'),
('Folk revival songs', 'setting', 'Songs from the folk revival era', ARRAY['Blowin in the Wind - Bob Dylan', 'If I Had a Hammer - Pete Seeger', 'Where Have All the Flowers Gone - Kingston Trio', 'This Land Is Your Land - Woody Guthrie'], true, 'music'),
('Synthpop classics', 'setting', 'Synth-heavy pop songs', ARRAY['Cars - Gary Numan', 'Tainted Love - Soft Cell', 'I Ran - A Flock of Seagulls', 'Dont You Want Me - Human League'], true, 'music'),
('EDM festival anthems', 'setting', 'Electronic dance music hits', ARRAY['Levels - Avicii', 'Titanium - David Guetta', 'Animals - Martin Garrix', 'Wake Me Up - Avicii'], true, 'music'),
('90s hip-hop classics', 'setting', 'Defining 90s rap songs', ARRAY['Juicy - Notorious B.I.G.', 'California Love - Tupac', 'Nuthin but a G Thang - Dr. Dre', 'C.R.E.A.M. - Wu-Tang Clan'], true, 'music'),
('Alternative rock 90s', 'setting', 'Alternative rock hits', ARRAY['Creep - Radiohead', 'Loser - Beck', 'Wonderwall - Oasis', 'Closing Time - Semisonic'], true, 'music'),
('Power ballads', 'setting', '80s rock ballads', ARRAY['Every Rose Has Its Thorn - Poison', 'I Want to Know What Love Is - Foreigner', 'Heaven - Bryan Adams', 'Home Sweet Home - Motley Crue'], true, 'music'),
('Early rock and roll classics', 'setting', '50s rock and roll', ARRAY['Johnny B. Goode - Chuck Berry', 'Tutti Frutti - Little Richard', 'Hound Dog - Elvis Presley', 'Great Balls of Fire - Jerry Lee Lewis'], true, 'music'),
('Surf rock songs', 'setting', '60s surf music', ARRAY['Wipe Out - The Surfaris', 'Surfin USA - Beach Boys', 'Miserlou - Dick Dale', 'Pipeline - The Chantays'], true, 'music'),
('Southern rock anthems', 'setting', 'Southern rock classics', ARRAY['Free Bird - Lynyrd Skynyrd', 'Ramblin Man - Allman Brothers', 'The Devil Went Down to Georgia - Charlie Daniels', 'Rockin into the Night - .38 Special'], true, 'music'),
('Indie rock 2000s', 'setting', '2000s indie rock songs', ARRAY['Mr. Brightside - The Killers', 'Take Me Out - Franz Ferdinand', 'Float On - Modest Mouse', 'Maps - Yeah Yeah Yeahs'], true, 'music'),
('Classic soul songs', 'setting', '60s and 70s soul music', ARRAY['Whats Going On - Marvin Gaye', 'Respect - Aretha Franklin', 'A Change Is Gonna Come - Sam Cooke', 'Sittin on the Dock of the Bay - Otis Redding'], true, 'music') ON CONFLICT (name) DO NOTHING;

-- CULTURAL/META (10 new)
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs from iconic movie soundtracks', 'cultural', 'Songs famous from films', ARRAY['Dont You Forget About Me - Breakfast Club', 'My Heart Will Go On - Titanic', 'Eye of the Tiger - Rocky III', 'Footloose - Footloose'], true, 'music'),
('Songs used in car commercials', 'cultural', 'Songs in auto advertisements', ARRAY['Holiday - Green Day (Volkswagen)', 'Are You Gonna Be My Girl - Jet (iPod)', 'Crazy Train - various', 'Start Me Up - Windows 95'], true, 'music'),
('Super Bowl halftime songs', 'cultural', 'Songs performed at Super Bowls', ARRAY['Purple Rain - Prince', 'Crazy in Love - Beyonce', 'Poker Face - Lady Gaga', 'Moves Like Jagger - Maroon 5'], true, 'music'),
('Songs banned by BBC', 'cultural', 'Songs banned from British radio', ARRAY['God Save the Queen - Sex Pistols', 'Relax - Frankie Goes to Hollywood', 'Je TAime - Serge Gainsbourg', 'Lola - The Kinks'], true, 'music'),
('Karaoke staples', 'cultural', 'Most commonly sung karaoke songs', ARRAY['Dont Stop Believin - Journey', 'Bohemian Rhapsody - Queen', 'Sweet Caroline - Neil Diamond', 'Living on a Prayer - Bon Jovi'], true, 'music'),
('Songs that topped charts for 10+ weeks', 'cultural', 'Long-running number ones', ARRAY['Old Town Road - Lil Nas X', 'Despacito - Luis Fonsi', 'One Sweet Day - Mariah Carey', 'Uptown Funk - Bruno Mars'], true, 'music'),
('Songs with famous lawsuits', 'cultural', 'Songs involved in legal battles', ARRAY['Blurred Lines - Robin Thicke', 'Ice Ice Baby - Vanilla Ice', 'My Sweet Lord - George Harrison', 'Bitter Sweet Symphony - The Verve'], true, 'music'),
('Songs used at graduations', 'cultural', 'Common graduation ceremony songs', ARRAY['Good Riddance - Green Day', 'I Gotta Feeling - Black Eyed Peas', 'Forever Young - Rod Stewart', 'Dont You Forget About Me - Simple Minds'], true, 'music'),
('Songs played at weddings', 'cultural', 'Wedding reception standards', ARRAY['At Last - Etta James', 'Unchained Melody - Righteous Brothers', 'I Will Always Love You - Whitney Houston', 'Crazy Love - Van Morrison'], true, 'music'),
('Songs in dance video games', 'cultural', 'Songs from Dance Dance Revolution/Just Dance', ARRAY['Dynamite - Taio Cruz', 'Moves Like Jagger - Maroon 5', 'Toxic - Britney Spears', 'Cant Stop the Feeling - Justin Timberlake'], true, 'music') ON CONFLICT (name) DO NOTHING;

-- NARRATIVE STRUCTURE (10 new)
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs with key changes', 'narrative', 'Songs with modulation moments', ARRAY['I Wanna Dance with Somebody - Whitney Houston', 'Livin on a Prayer - Bon Jovi', 'My Heart Will Go On - Celine Dion', 'Man in the Mirror - Michael Jackson'], true, 'music'),
('Songs with fade out endings', 'narrative', 'Songs that fade to silence', ARRAY['Hey Jude - The Beatles', 'All You Need Is Love - The Beatles', 'Born to Run - Bruce Springsteen', 'Freebird - Lynyrd Skynyrd'], true, 'music'),
('Songs with dramatic pauses', 'narrative', 'Songs with intentional silence', ARRAY['In the Air Tonight - Phil Collins', 'Dont Stop Believin - Journey', 'Welcome to the Black Parade - MCR', 'Smells Like Teen Spirit - Nirvana'], true, 'music'),
('Songs with false endings', 'narrative', 'Songs that appear to end then continue', ARRAY['Strawberry Fields Forever - Beatles', 'Paranoid Android - Radiohead', 'Layla - Derek and the Dominos', 'A Day in the Life - Beatles'], true, 'music'),
('Songs with spoken word sections', 'narrative', 'Songs with talking parts', ARRAY['Rapper''s Delight - Sugarhill Gang', 'Stan - Eminem', 'Hotel California - Eagles', 'Thriller - Michael Jackson'], true, 'music'),
('Songs that build to crescendo', 'narrative', 'Songs with building intensity', ARRAY['Stairway to Heaven - Led Zeppelin', 'Bohemian Rhapsody - Queen', 'Hey Jude - The Beatles', 'Free Bird - Lynyrd Skynyrd'], true, 'music'),
('Songs with instrumental breaks', 'narrative', 'Songs with extended instrumentals', ARRAY['Free Bird - Lynyrd Skynyrd', 'Comfortably Numb - Pink Floyd', 'Hotel California - Eagles', 'November Rain - Guns N Roses'], true, 'music'),
('Songs with repeated lyrics', 'narrative', 'Songs with heavy repetition', ARRAY['Hey Jude - The Beatles', 'Around the World - Daft Punk', 'Bad Romance - Lady Gaga', 'Na Na Na - My Chemical Romance'], true, 'music'),
('Songs with narrative storytelling', 'narrative', 'Songs that tell complete stories', ARRAY['The Gambler - Kenny Rogers', 'Piano Man - Billy Joel', 'American Pie - Don McLean', 'Stan - Eminem'], true, 'music'),
('Songs with surprise endings', 'narrative', 'Songs with unexpected conclusions', ARRAY['Space Oddity - David Bowie', 'Hotel California - Eagles', 'Eleanor Rigby - Beatles', 'Stan - Eminem'], true, 'music') ON CONFLICT (name) DO NOTHING;

-- CHARACTER/VOCALIST (10 new)
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs with famous screams', 'character', 'Songs with iconic vocal screams', ARRAY['Wont Get Fooled Again - The Who', 'Immigrant Song - Led Zeppelin', 'Crazy Train - Ozzy Osbourne', 'You Shook Me All Night Long - AC/DC'], true, 'music'),
('Songs with whispered vocals', 'character', 'Songs featuring whispering', ARRAY['Dont Speak - No Doubt', 'Wicked Game - Chris Isaak', 'Take Me to Church - Hozier', 'Creep - Radiohead (soft parts)'], true, 'music'),
('Songs with vocal harmonies', 'character', 'Songs famous for harmonies', ARRAY['God Only Knows - Beach Boys', 'Bohemian Rhapsody - Queen', 'Africa - Toto', 'Carry On Wayward Son - Kansas'], true, 'music'),
('Songs with falsetto vocals', 'character', 'Songs featuring falsetto', ARRAY['Stayin Alive - Bee Gees', 'Take On Me - a-ha', 'Kiss from a Rose - Seal', 'Somebody That I Used to Know - Gotye'], true, 'music'),
('Songs with growling vocals', 'character', 'Songs with aggressive vocal styles', ARRAY['Killing in the Name - RATM', 'Du Hast - Rammstein', 'Down with the Sickness - Disturbed', 'Break Stuff - Limp Bizkit'], true, 'music'),
('Songs with choir vocals', 'character', 'Songs featuring choirs', ARRAY['Like a Prayer - Madonna', 'You Cant Always Get What You Want - Rolling Stones', 'Bridge Over Troubled Water - S&G', 'One - U2'], true, 'music'),
('Songs with recognizable laughs', 'character', 'Songs with laughter in them', ARRAY['Thriller - Michael Jackson', 'Crazy Train - Ozzy Osbourne', 'Creep - TLC', 'Feel Good Inc - Gorillaz'], true, 'music'),
('Songs with autotune vocals', 'character', 'Songs famous for autotune', ARRAY['Believe - Cher', 'Buy U a Drank - T-Pain', 'Just Dance - Lady Gaga', 'Love Lockdown - Kanye West'], true, 'music'),
('Songs with yodeling', 'character', 'Songs featuring yodeling', ARRAY['Lovesick Blues - Hank Williams', 'Blue Yodel - Jimmie Rodgers', 'The Lonely Goatherd - Sound of Music', 'Focus - Hocus Pocus'], true, 'music'),
('Songs with whistling', 'character', 'Songs featuring whistling', ARRAY['Patience - Guns N Roses', 'Young Folks - Peter Bjorn and John', 'Wind of Change - Scorpions', 'Sittin on the Dock of the Bay - Otis Redding'], true, 'music') ON CONFLICT (name) DO NOTHING;

-- PRODUCTION (5 new)
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs with iconic drum intros', 'production', 'Songs with famous drum openings', ARRAY['In the Air Tonight - Phil Collins', 'When the Levee Breaks - Led Zeppelin', 'Hot for Teacher - Van Halen', 'YYZ - Rush'], true, 'music'),
('Songs with iconic guitar riffs', 'production', 'Songs with famous guitar hooks', ARRAY['Smoke on the Water - Deep Purple', 'Back in Black - AC/DC', 'Sweet Child O Mine - Guns N Roses', 'Enter Sandman - Metallica'], true, 'music'),
('Songs with iconic bass lines', 'production', 'Songs with famous bass hooks', ARRAY['Another One Bites the Dust - Queen', 'Money - Pink Floyd', 'Come Together - Beatles', 'Under Pressure - Queen/Bowie'], true, 'music'),
('Songs with iconic piano intros', 'production', 'Songs with famous piano openings', ARRAY['Piano Man - Billy Joel', 'Clocks - Coldplay', 'Bohemian Rhapsody - Queen', 'Let It Be - Beatles'], true, 'music'),
('Songs recorded in one take', 'production', 'Songs recorded without edits', ARRAY['Twist and Shout - Beatles', 'Born to Run - Springsteen (vocal)', 'Live performances generally'], true, 'music') ON CONFLICT (name) DO NOTHING;

-- SPECIFIC ELEMENTS (5 new)
INSERT INTO connection_types (name, category, description, examples, active, genre) VALUES
('Songs with hand claps', 'elements', 'Songs featuring clapping percussion', ARRAY['We Will Rock You - Queen', 'I Want You Back - Jackson 5', 'Hey Ya - OutKast', 'Blinding Lights - The Weeknd'], true, 'music'),
('Songs with horn sections', 'elements', 'Songs with brass instruments', ARRAY['Sir Duke - Stevie Wonder', 'September - Earth Wind & Fire', 'Pick Up the Pieces - AWB', 'Uptown Funk - Bruno Mars'], true, 'music'),
('Songs with strings', 'elements', 'Songs with orchestral strings', ARRAY['Yesterday - Beatles', 'Eleanor Rigby - Beatles', 'Bittersweet Symphony - The Verve', 'Kashmir - Led Zeppelin'], true, 'music'),
('Songs with synthesizer solos', 'elements', 'Songs with synth lead lines', ARRAY['Jump - Van Halen', 'Take On Me - a-ha', 'The Final Countdown - Europe', 'Tom Sawyer - Rush'], true, 'music'),
('Songs with sitar', 'elements', 'Songs featuring sitar', ARRAY['Norwegian Wood - Beatles', 'Paint It Black - Rolling Stones', 'Within You Without You - Beatles', 'Heart Full of Soul - Yardbirds'], true, 'music') ON CONFLICT (name) DO NOTHING;
