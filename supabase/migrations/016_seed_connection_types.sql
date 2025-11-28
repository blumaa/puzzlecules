-- Seed Initial Connection Types
-- Categories: word-game, people, thematic, setting, cultural, narrative, character, production, elements

-- =============================================================================
-- WORD/TITLE GAMES
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Titles that are verbs', 'word-game', 'Films with single-word titles that are action verbs', ARRAY['Run', 'Drive', 'Crash', 'Taken'], true),
('Titles that are questions', 'word-game', 'Films with titles phrased as questions', ARRAY['What Ever Happened to Baby Jane?', 'Who Framed Roger Rabbit?', 'Where Eagles Dare'], true),
('One-word titles', 'word-game', 'Films with exactly one word in the title', ARRAY['Jaws', 'Alien', 'Psycho', 'Vertigo'], true),
('Titles with numbers', 'word-game', 'Films with numbers in the title', ARRAY['12 Angry Men', 'Se7en', '2001: A Space Odyssey', 'The Magnificent Seven'], true),
('Titles with colors', 'word-game', 'Films with color words in the title', ARRAY['The Color Purple', 'Blue Velvet', 'The Green Mile', 'Orange County'], true),
('Alliterative titles', 'word-game', 'Films where the title words start with the same letter', ARRAY['King Kong', 'Dirty Dancing', 'Private Parts', 'Mad Max'], true),
('Titles with animals', 'word-game', 'Films with animal names in the title', ARRAY['The Birds', 'Reservoir Dogs', 'Cat on a Hot Tin Roof', 'The Silence of the Lambs'], true),
('Titles that are names', 'word-game', 'Films titled with a character name only', ARRAY['Rebecca', 'Amélie', 'Forrest Gump', 'Rocky'], true),
('Titles with body parts', 'word-game', 'Films with body parts in the title', ARRAY['The Hand', 'Eyes Wide Shut', 'Fists of Fury', 'Heart of Darkness'], true),
('Titles with time words', 'word-game', 'Films with time-related words in the title', ARRAY['Midnight Cowboy', 'Tomorrow Never Dies', 'The Day After Tomorrow', 'Eternal Sunshine'], true);

-- =============================================================================
-- PEOPLE/CAREER
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Directed by a specific director', 'people', 'Films all directed by the same filmmaker', ARRAY['Films directed by Spielberg', 'Films directed by Nolan', 'Films directed by Hitchcock'], true),
('Starring a specific actor', 'people', 'Films featuring the same lead actor', ARRAY['Films starring Tom Hanks', 'Films starring Meryl Streep', 'Films starring Denzel Washington'], true),
('First films by directors', 'people', 'Directorial debuts that launched careers', ARRAY['Reservoir Dogs (Tarantino)', 'Following (Nolan)', 'THX 1138 (Lucas)'], true),
('Final films of actors/directors', 'people', 'Last films before retirement or death', ARRAY['Eyes Wide Shut (Kubrick)', 'The Misfits (Gable)', 'Giant (Dean)'], true),
('Oscar-winning performances', 'people', 'Films featuring Academy Award-winning acting', ARRAY['The Godfather', 'One Flew Over the Cuckoos Nest', 'Silence of the Lambs'], true),
('Director also stars', 'people', 'Films where the director acts in the lead role', ARRAY['Citizen Kane', 'The Artist', 'Braveheart', 'A Quiet Place'], true),
('Iconic composer scores', 'people', 'Films scored by legendary composers', ARRAY['John Williams scores', 'Hans Zimmer scores', 'Ennio Morricone scores'], true),
('Actor duos reunited', 'people', 'Films featuring the same acting pair', ARRAY['Newman/Redford films', 'Lemmon/Matthau films', 'De Niro/Pesci films'], true),
('Screenwriter showcases', 'people', 'Films known for a specific screenwriters work', ARRAY['Aaron Sorkin scripts', 'Charlie Kaufman scripts', 'Quentin Tarantino scripts'], true),
('Breakthrough performances', 'people', 'Films that launched an actors career', ARRAY['Risky Business (Cruise)', 'Thelma & Louise (Pitt)', 'The Mask (Diaz)'], true);

-- =============================================================================
-- THEMATIC/PLOT
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Films about fatherhood', 'thematic', 'Films exploring father-child relationships', ARRAY['Finding Nemo', 'The Pursuit of Happyness', 'Big Fish', 'Interstellar'], true),
('Protagonist is a robot/AI', 'thematic', 'Films with artificial beings as main characters', ARRAY['WALL-E', 'Ex Machina', 'Blade Runner', 'A.I. Artificial Intelligence'], true),
('Unreliable narrators', 'thematic', 'Films where the narrator cannot be trusted', ARRAY['Fight Club', 'The Usual Suspects', 'Gone Girl', 'Shutter Island'], true),
('Villain wins in the end', 'thematic', 'Films where the antagonist prevails', ARRAY['Se7en', 'No Country for Old Men', 'Chinatown', 'The Empire Strikes Back'], true),
('Based on true stories', 'thematic', 'Films depicting real events', ARRAY['Schindlers List', 'The Social Network', 'Erin Brockovich', '12 Years a Slave'], true),
('Time loop narratives', 'thematic', 'Films featuring repeating time cycles', ARRAY['Groundhog Day', 'Edge of Tomorrow', 'Palm Springs', 'Happy Death Day'], true),
('Heist films', 'thematic', 'Films centered on elaborate robberies', ARRAY['Oceans Eleven', 'Heat', 'The Italian Job', 'Inside Man'], true),
('Revenge stories', 'thematic', 'Films driven by vengeance', ARRAY['Kill Bill', 'Oldboy', 'John Wick', 'The Count of Monte Cristo'], true),
('Coming-of-age stories', 'thematic', 'Films about growing up and self-discovery', ARRAY['Stand by Me', 'The Breakfast Club', 'Lady Bird', 'Boyhood'], true),
('Fish out of water', 'thematic', 'Films about characters in unfamiliar environments', ARRAY['Crocodile Dundee', 'Big', 'Elf', 'Coming to America'], true),
('Protagonist has amnesia', 'thematic', 'Films featuring memory loss as plot device', ARRAY['Memento', 'The Bourne Identity', 'Total Recall', 'Finding Dory'], true),
('Films about obsession', 'thematic', 'Films exploring unhealthy fixations', ARRAY['Black Swan', 'Whiplash', 'The Prestige', 'Phantom Thread'], true);

-- =============================================================================
-- SETTING/VISUAL
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Set entirely in one location', 'setting', 'Films confined to a single place', ARRAY['12 Angry Men', 'Rear Window', 'The Breakfast Club', 'Reservoir Dogs'], true),
('Films set in New York City', 'setting', 'Films primarily taking place in NYC', ARRAY['Taxi Driver', 'Manhattan', 'Do the Right Thing', 'Spider-Man'], true),
('Takes place over one night', 'setting', 'Films with overnight timeframes', ARRAY['After Hours', 'Collateral', 'Superbad', 'Before Sunrise'], true),
('Black and white films', 'setting', 'Films shot without color', ARRAY['Schindlers List', 'The Artist', 'Raging Bull', 'Manhattan'], true),
('Underwater sequences', 'setting', 'Films featuring significant underwater scenes', ARRAY['The Abyss', 'Finding Nemo', 'Titanic', 'Aquaman'], true),
('Films set in the future', 'setting', 'Science fiction films in futuristic settings', ARRAY['Blade Runner', 'The Matrix', 'Her', 'Minority Report'], true),
('Road trip films', 'setting', 'Films featuring journeys across landscapes', ARRAY['Easy Rider', 'Thelma & Louise', 'Little Miss Sunshine', 'Mad Max: Fury Road'], true),
('Films set in space', 'setting', 'Films taking place primarily in outer space', ARRAY['2001: A Space Odyssey', 'Gravity', 'Alien', 'Apollo 13'], true),
('Films set in Paris', 'setting', 'Films primarily taking place in Paris', ARRAY['Amélie', 'Midnight in Paris', 'An American in Paris', 'Ratatouille'], true),
('Films set in schools', 'setting', 'Films taking place in educational institutions', ARRAY['Dead Poets Society', 'Harry Potter series', 'Grease', 'Election'], true);

-- =============================================================================
-- CULTURAL/META
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Cult classics', 'cultural', 'Films with devoted fan followings', ARRAY['The Rocky Horror Picture Show', 'The Big Lebowski', 'Donnie Darko', 'Office Space'], true),
('Box office bombs that became beloved', 'cultural', 'Commercial failures now considered classics', ARRAY['The Shawshank Redemption', 'Its a Wonderful Life', 'Blade Runner', 'Fight Club'], true),
('Films that were banned', 'cultural', 'Films prohibited in various countries', ARRAY['A Clockwork Orange', 'The Exorcist', 'Natural Born Killers', 'The Last Temptation of Christ'], true),
('Remakes of foreign films', 'cultural', 'Hollywood adaptations of international movies', ARRAY['The Departed', 'The Ring', 'True Lies', 'Vanilla Sky'], true),
('Based on video games', 'cultural', 'Films adapted from video game properties', ARRAY['Tomb Raider', 'Resident Evil', 'Sonic the Hedgehog', 'Detective Pikachu'], true),
('Film festival winners', 'cultural', 'Films awarded at major festivals', ARRAY['Parasite', 'Pulp Fiction', 'The Piano', 'Roma'], true),
('Famous plot twists', 'cultural', 'Films known for shocking revelations', ARRAY['The Sixth Sense', 'Planet of the Apes', 'Psycho', 'The Crying Game'], true),
('Films within films', 'cultural', 'Meta films about filmmaking', ARRAY['8½', 'Day for Night', 'The Player', 'Once Upon a Time in Hollywood'], true),
('Midnight movie classics', 'cultural', 'Films popular in midnight screenings', ARRAY['The Rocky Horror Picture Show', 'Eraserhead', 'El Topo', 'Pink Flamingos'], true),
('Spawned famous quotes', 'cultural', 'Films with iconic, oft-repeated lines', ARRAY['Casablanca', 'The Godfather', 'Jerry Maguire', 'Forrest Gump'], true);

-- =============================================================================
-- NARRATIVE STRUCTURE
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Non-linear timelines', 'narrative', 'Films told out of chronological order', ARRAY['Pulp Fiction', 'Memento', 'Arrival', 'Dunkirk'], true),
('Told in reverse', 'narrative', 'Films structured backwards chronologically', ARRAY['Memento', 'Irreversible', 'Betrayal', 'Peppermint Candy'], true),
('Multiple perspectives', 'narrative', 'Films showing same events from different viewpoints', ARRAY['Rashomon', 'Vantage Point', 'Gone Girl', 'The Affair'], true),
('Narrator dies', 'narrative', 'Films where the storyteller perishes', ARRAY['American Beauty', 'Sunset Boulevard', 'The Lovely Bones', 'Titanic'], true),
('Dream sequences central to plot', 'narrative', 'Films where dreams drive the story', ARRAY['Inception', 'Mulholland Drive', 'The Science of Sleep', 'Paprika'], true),
('Fourth wall breaks', 'narrative', 'Films where characters address the audience', ARRAY['Ferris Buellers Day Off', 'Deadpool', 'The Wolf of Wall Street', 'Amelie'], true),
('Ambiguous endings', 'narrative', 'Films with interpretive conclusions', ARRAY['Inception', 'The Graduate', 'Birdman', 'No Country for Old Men'], true),
('Circular narratives', 'narrative', 'Films that end where they began', ARRAY['Pulp Fiction', '12 Monkeys', 'Looper', 'Arrival'], true);

-- =============================================================================
-- CHARACTER ARCHETYPES
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Anti-heroes as protagonists', 'character', 'Films with morally ambiguous main characters', ARRAY['Taxi Driver', 'A Clockwork Orange', 'There Will Be Blood', 'Nightcrawler'], true),
('Female-led action films', 'character', 'Action movies with women as leads', ARRAY['Alien', 'Kill Bill', 'Wonder Woman', 'Mad Max: Fury Road'], true),
('Child protagonists', 'character', 'Films with children as main characters', ARRAY['E.T.', 'Home Alone', 'Pan''s Labyrinth', 'Room'], true),
('Elderly protagonists', 'character', 'Films featuring older main characters', ARRAY['Up', 'The Bucket List', 'Nebraska', 'The Straight Story'], true),
('Ensemble casts', 'character', 'Films with no single lead, multiple stars', ARRAY['The Big Chill', 'Love Actually', 'Magnolia', 'Crash'], true),
('Villain protagonist', 'character', 'Films where we follow the bad guy', ARRAY['A Clockwork Orange', 'American Psycho', 'Nightcrawler', 'Wolf of Wall Street'], true),
('Buddy dynamics', 'character', 'Films built around partner relationships', ARRAY['Lethal Weapon', 'Midnight Run', 'Rush Hour', 'Men in Black'], true),
('Transformation arcs', 'character', 'Films about characters undergoing major change', ARRAY['The Fly', 'Black Swan', 'Raging Bull', 'Monster'], true);

-- =============================================================================
-- PRODUCTION
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Troubled productions that became classics', 'production', 'Films with difficult shoots that succeeded', ARRAY['Apocalypse Now', 'Jaws', 'Titanic', 'The Wizard of Oz'], true),
('Directors cuts significantly different', 'production', 'Films with notably altered extended versions', ARRAY['Blade Runner', 'Apocalypse Now', 'Brazil', 'Kingdom of Heaven'], true),
('Famous improvised scenes', 'production', 'Films with iconic unscripted moments', ARRAY['Taxi Driver', 'The Shining', 'Jaws', 'Goodfellas'], true),
('Shot in under 30 days', 'production', 'Films made with extremely fast shoots', ARRAY['Clerks', 'Halloween', 'Paranormal Activity', 'The Blair Witch Project'], true),
('Directorial debuts', 'production', 'First feature films by directors', ARRAY['Citizen Kane', 'Reservoir Dogs', 'Get Out', 'Blood Simple'], true),
('Practical effects showcases', 'production', 'Films known for physical rather than CGI effects', ARRAY['The Thing', 'Mad Max: Fury Road', 'Jurassic Park', 'An American Werewolf in London'], true),
('Made for under 1 million dollars', 'production', 'Ultra-low budget successful films', ARRAY['Paranormal Activity', 'The Blair Witch Project', 'Clerks', 'Pi'], true),
('Long production histories', 'production', 'Films that took many years to complete', ARRAY['Boyhood', 'Avatar', 'The Thief and the Cobbler', 'Apocalypse Now'], true);

-- =============================================================================
-- SPECIFIC ELEMENTS
-- =============================================================================
INSERT INTO connection_types (name, category, description, examples, active) VALUES
('Rain in climactic scenes', 'elements', 'Films with important moments in rain', ARRAY['The Shawshank Redemption', 'Blade Runner', 'Singin in the Rain', 'Seven'], true),
('Memorable food scenes', 'elements', 'Films featuring iconic eating moments', ARRAY['When Harry Met Sally', 'Goodfellas', 'Ratatouille', 'Big Night'], true),
('Dance sequences in non-musicals', 'elements', 'Dancing moments in dramatic films', ARRAY['Pulp Fiction', 'Silver Linings Playbook', 'Napoleon Dynamite', 'Ex Machina'], true),
('Letters/notes as plot device', 'elements', 'Films where written messages drive the story', ARRAY['The Notebook', 'P.S. I Love You', 'Message in a Bottle', 'Her'], true),
('Mirrors used symbolically', 'elements', 'Films using mirror imagery thematically', ARRAY['Black Swan', 'Taxi Driver', 'Mulholland Drive', 'The Shining'], true),
('Trains featured prominently', 'elements', 'Films with significant train sequences', ARRAY['Strangers on a Train', 'The Darjeeling Limited', 'Murder on the Orient Express', 'Snowpiercer'], true),
('Phone calls drive the plot', 'elements', 'Films where phone conversations are central', ARRAY['Phone Booth', 'Dial M for Murder', 'The Call', 'Taken'], true),
('Clocks/time as visual motif', 'elements', 'Films emphasizing time through imagery', ARRAY['High Noon', 'Back to the Future', 'Hugo', 'Interstellar'], true),
('Staircases as significant locations', 'elements', 'Films using stairs dramatically', ARRAY['Vertigo', 'Psycho', 'The Exorcist', 'Joker'], true),
('Opening scenes set the tone', 'elements', 'Films with iconic opening sequences', ARRAY['Jaws', 'Raiders of the Lost Ark', 'The Dark Knight', 'Up'], true);
