$(function() {
	var button = $('#submitButton'),
		textInput = $('#textInput'),
		results = $('.results'),
		tabs = results.find('.tabs'),
		message = $('.message'),
		selectedAccountType = 2,
		playerName = $('.player-name'),
		hashes = {
			3159615086: 'Glimmer',
			1415355184: 'Crucible Marks',
			1415355173: 'Vanguard Marks',
			898834093: 'Exo',
			3887404748: 'Human',
			2803282938: 'Awoken',
			3111576190: 'Male',
			2204441813: 'Female',
			671679327: 'Hunter',
			3655393761: 'Titan',
			2271682572: 'Warlock',
			2030054750: 'Mote of Light',
			weeklyMarks: {
				2033897742: 'Vanguard Marks',
				2033897755: 'Crucible Marks'
			},
			activities: {
				1564581372: {name: "The Will of Crota"},
				1564581373: {name: "The Will of Crota"},
				1564581374: {name: "The Will of Crota"},
				2071946061: {name: "Winter's Run"},
				2071946062: {name: "Winter's Run"},
				2071946063: {name: "Winter's Run"},
				2418687432: {name: "The Nexus"},
				2418687433: {name: "The Nexus"},
				2418687435: {name: "The Nexus"},
				2619245816: {name: "The Will of Crota"},
				2619245818: {name: "The Will of Crota"},
				2619245819: {name: "The Will of Crota"},
				325091109: {name: "The Will of Crota"},
				325091110: {name: "The Will of Crota"},
				325091111: {name: "The Will of Crota"},
				3468792472: {name: "The Devil's Lair"},
				3468792473: {name: "The Devil's Lair"},
				3468792474: {name: "The Devil's Lair"},
				3896672076: {name: "Summoning Pits"},
				3896672078: {name: "Summoning Pits"},
				3896672079: {name: "Summoning Pits"},
				3992306896: {name: "The Will of Crota"},
				3992306898: {name: "The Will of Crota"},
				3992306899: {name: "The Will of Crota"},
				692589233: {name: "Cerberus Vae III"},
				692589234: {name: "Cerberus Vae III"},
				692589235: {name: "Cerberus Vae III"},
				921825796: {name: "The Will of Crota"},
				921825797: {name: "The Will of Crota"},
				921825799: {name: "The Will of Crota"},
				325091108: {name: "The Will of Crota"},
				3896672077: {name: "Summoning Pits"},
				2418687434: {name: "The Nexus"},
				1564581375: {name: "The Will of Crota"},
				2071946060: {name: "Winter's Run"},
				2619245817: {name: "The Will of Crota"},
				3468792475: {name: "The Devil's Lair"},
				3992306897: {name: "The Will of Crota"},
				692589232: {name: "Cerberus Vae III"},
				921825798: {name: "The Will of Crota"},
				2659248071: {name: "Vault of Glass"},
				2659248068: {name: "Vault of Glass"},
				2591274210: {name: "The Devil's Lair"},
				3304208793: {name: "Cerberus Vae III"},
				2495639390: {name: "Winter's Run"}
			},
			caps: {
				3159615086: 25000,
				1415355184: 200,
				1415355173: 200,
				2033897742: 100,
				2033897755: 100
			},
			activityTypes: {
				575572995: 'strike',
				2043403989: 'raid'
			}
		},
		playerData = {},
		userPrefs = {},
		progressStyleOptions = ['progress-box','progress-horizontal'];

	function getUrlVars()
	{
	    var vars = [], hash;
	    var hashes = window.location.href.slice(window.location.href.indexOf('#') + 1).split('&');
	    for(var i = 0; i < hashes.length; i++)
	    {
	        hash = hashes[i].split('=');
	        vars.push(hash[0]);
	        vars[hash[0]] = hash[1];
	    }
	    return vars;
	}

	function performSearch() {
		startLoading();
		$.ajax({
			url: '/search', 
			type: 'POST',
			data: JSON.stringify({username:textInput.val().replace(/\s/g, ''), membershipType:selectedAccountType, key:'01242015'}),
			contentType:'application/json; charset=utf-8',
			dataType:'json'
		}).done(function(res){
			playerData = res;
			if(playerData.characters) {
				sortPlayerData();
				mapPlayerData();
				displayPlayerData();
				results.show();
			}
			stopLoading(playerData.error);
		}).fail(function(err){
			stopLoading(err);
		});
	}

	function startLoading() {
		showMessage({text:'loading...',level:'info'});
		button.attr('disabled',true);
		results.hide();
		playerName.empty();
	}

	function stopLoading(err) {
		if(err) {
			showError(err);
		} else {
			message.empty();
			playerName.text(playerData.membership.displayName);
			scrollToDiv(results);
		}
		button.attr('disabled',false);
		$('.nav-tabs li').get(0).click();
	}

	function sortPlayerData() {
		if(!playerData.characters || playerData.characters.length <= 1) {
			return;
		}
		playerData.characters.sort(function(a,b) {
			return new Date(b.dateLastPlayed) - new Date(a.dateLastPlayed);
		});
	}

	function mapPlayerData() {
		getRecentResetDates();
		mapAllCharacters();

		function getRecentResetDates() {
			playerData.mostRecentWeeklyReset = getDateOfMostRecentWeeklyReset();
			playerData.mostRecentDailyReset = getDateOfMostRecentDailyReset();
		}

		function mapAllCharacters() {
			for(var i=0; i<playerData.characters.length;i++) {
				mapCharacterData(playerData.characters[i]);
			}
		}
	}

	function mapCharacterData(character) {
		calculatePlayedSinceReset();
		initializeBoxes();
		mapLight();
		mapMotes();
		mapCurrencies();
		mapActivities();
		mapFactions();

		function calculatePlayedSinceReset() {
			var characterDate = new Date(character.dateLastPlayed);
			character.playedSinceWeeklyReset = characterDate - playerData.mostRecentWeeklyReset > 0;
			character.playedSinceDailyReset = characterDate - playerData.mostRecentDailyReset > 0;
		}

		function initializeBoxes() {
			character.boxes = {};
			character.boxes.current = {
				light: {},
				motes: {},
				currencies: [],
				factions: [],
				activities: []
			};
			character.boxes.weekly = {
				currencies: {},
				factions: [],
				activities: []
			};
			character.boxes.daily = {
				currencies: {},
				factions: []
			};
		}
		
		function mapLight() {
			var bungiePathPrefix = '//bungie.net';
			character.boxes.current.light = {
				isHeader: true,
				title: hashes[character.classHash] + ' ' + character.level,
				type: 'light',
				label: 'Click to view on Bungie.net',
				iconPath: bungiePathPrefix + character.customization.emblemPath,
				backgroundPath: bungiePathPrefix + character.customization.backgroundPath,
				percentToNextLevel: 0,
				footer: hashes[character.genderHash] + ' ' + hashes[character.raceHash],
				progressColor: '#f5dc56',
				link: 'http://www.bungie.net/en/Legend/' + playerData.membership.type + '/' + playerData.membership.id + '/' + character.id + '#gear'
			};
		}

		function mapMotes() {
			character.boxes.current.motes = {
				title: 'Mote of Light',
				type: 'mote-of-light',
				label: 'Next Mote of Light',
				progress: character.progressions[2030054750].progressToNextLevel,
				max: character.progressions[2030054750].nextLevelAt
			};
			character.boxes.weekly.motes = {
				title: 'Weekly/Lifetime',
				type: 'mote-of-light',
				label: 'Next Mote of Light',
				progress: character.progressions[2030054750].weeklyProgress,
				max: character.progressions[2030054750].currentProgress
			};
			character.boxes.daily.motes = {
				title: 'Daily/Weekly',
				type: 'mote-of-light',
				label: 'Next Mote of Light',
				progress: character.progressions[2030054750].dailyProgress,
				max: character.progressions[2030054750].weeklyProgress
			};
		}
		
		function mapCurrencies() {
			character.boxes.current.currencies = [];
			$.each(character.inventory.currencies, function(hash, currency) {
				character.boxes.current.currencies.push({
					title: hashes[hash],
					type: hashes[hash].toLowerCase().replace(/\s/g, '-'),
					label: hashes[hash],
					progress: currency.value,
					max: hashes.caps[hash]
				});
			});

			character.boxes.weekly.currencies = {
				vanguardMarks: {
					title: 'Weekly',
					type: 'vanguard-marks',
					label: 'Weekly Vanguard Marks',
					progress: character.progressions[2033897742].level,
					max: hashes.caps[2033897742]
				},
				crucibleMarks: {
					title: 'Weekly',
					type: 'crucible-marks',
					label: 'Weekly Crucible Marks',
					progress: character.progressions[2033897755].level,
					max: hashes.caps[2033897755]
				}
			};

			character.boxes.daily.currencies = {
				vanguardMarks: {
					title: 'Daily',
					type: 'vanguard-marks',
					label: 'Daily Vanguard Marks',
					progress: character.progressions[2033897742].dailyProgress,
					max: hashes.caps[2033897742]
				},
				crucibleMarks: {
					title: 'Daily',
					type: 'crucible-marks',
					label: 'Daily Crucible Marks',
					progress: character.progressions[2033897755].dailyProgress,
					max: hashes.caps[2033897755]
				}
			};

		}

		function mapActivities() {

			var activities = {};

			$.each(character.activities, function(hash, activity) {
				var definition = character.definitions[hash];
				var activityProgression = activities[definition.activityName] || {
					hash: hash,
					highestLevelCompleted: 0,
					progress: 0,
					maxProgress: 0,
					lowestLevel: definition.activityLevel
				};

				activityProgression.lowestLevel = Math.min(activityProgression.lowestLevel, definition.activityLevel);
				activityProgression.name = activityProgression.name || (hashes.activities[hash] && hashes.activities[hash].name) || definition.activityName;
				activityProgression.type = activityProgression.type || getActivityType(hash);

				activityProgression.maxProgress += definition.activityLevel;
				if(activity.isCompleted) {
					activityProgression.progress += definition.activityLevel;
					if(definition.activityLevel > activityProgression.highestLevelCompleted) {
						activityProgression.hash = hash;
						activityProgression.highestLevelCompleted = definition.activityLevel;
					}
				}

				activities[definition.activityName] = activityProgression;
			});

			function getActivityType(hash) {
				var name = character.definitions[hash].activityName.toLowerCase();
				if(name.indexOf('nightfall') > -1) {
					return 'nightfall';
				}
				if(name.indexOf('weekly heroic') > -1) {
					return 'weekly-heroic';
				}
				return 'raid';
			}

			$.each(activities, function(i, val) {
				var box = {
					title: val.name,
					type: val.type,
					progress: val.progress,
					max: val.maxProgress
				};
				var level = val.highestLevelCompleted || val.lowestLevel;

				if(val.type === 'raid') {
					box.label = 'Lifetime Raid Completion';
					box.footer = 'Raid Level ' + level;
					character.boxes.current.activities.push(box);
				} else {
					box.label = 'Weekly Strike';
					if(val.type === 'nightfall') {
						box.footer = 'Nightfall Level ' + level;
					} else {
						box.footer = 'Heroic Level ' + level;
					}
					character.boxes.weekly.activities.push(box);
				}
			});
			
		}

		function mapFactions() {

			factions = [
				{hash: 529303302, name: 'Cryptarch'},
				{hash: 3233510749, name: 'Vanguard'},
				{hash: 1357277120, name: 'Crucible'},
				{hash: 2778795080, name: 'Dead Orbit'},
				{hash: 1424722124, name: 'Future War Cult'},
				{hash: 3871980777, name: 'New Monarchy'},
				{hash: 452808717, name: 'Queen'},
				{hash: 2161005788, name: 'Iron Banner'},
				{hash: 174528503, name: 'Crota\'s Bane'}
			];

			$.each(factions, function(i, faction) {
				var hash = faction.hash;
				if(!character.progressions[hash]) {
					return;
				}
				var type = faction.name.toLowerCase().replace(/\s/g, '-').replace(/\'/, '');
				character.boxes.current.factions.push({
					title: 'Rank ' + (character.progressions[hash].level || 0),
					type: type,
					label: faction.name,
					progress: character.progressions[hash].progressToNextLevel,
					max: character.progressions[hash].nextLevelAt
				});
				character.boxes.weekly.factions.push({
					title: 'Weekly/Lifetime',
					type: type,
					label: faction.name,
					progress: character.progressions[hash].weeklyProgress,
					max: character.progressions[hash].currentProgress
				});
				character.boxes.daily.factions.push({
					title: 'Daily/Weekly',
					type: type,
					label: faction.name,
					progress: character.progressions[hash].dailyProgress,
					max: character.progressions[hash].weeklyProgress
				});
			});
		}

	}

	function getDateOfMostRecentDailyReset(dateLastPlayed) {
		var date = dateLastPlayed? new Date(dateLastPlayed) : new Date();
		if(date.getUTCHours() < 9) {
			date.setUTCDate(date.getUTCDate() - 1);
		}
		date.setUTCHours(9);
		date.setUTCMinutes(0);
		date.setUTCSeconds(0);
		date.setUTCMilliseconds(0);
		return date;
	}

	function getDateOfMostRecentWeeklyReset(dateLastPlayed) {
		var date = dateLastPlayed? new Date(dateLastPlayed) : new Date();
		var currentDayOfWeek = date.getUTCDay();
		var distanceToMostRecentTuesday = currentDayOfWeek - 2;
		if(distanceToMostRecentTuesday < 0 || (distanceToMostRecentTuesday === 0 && date.getUTCHours() < 9)) {
			distanceToMostRecentTuesday += 7;
		}
		date.setUTCDate(date.getUTCDate() - distanceToMostRecentTuesday);
		date.setUTCHours(9);
		date.setUTCMinutes(0);
		date.setUTCSeconds(0);
		date.setUTCMilliseconds(0);
		return date;
	}

	function displayPlayerData() {
		tabs.find('.tab').empty();
		if(!playerData.characters || !playerData.characters.length) {
			return;
		}
		for(var i=0; i<playerData.characters.length;i++) {
			displayCharacterData(playerData.characters[i]);
		}
	}

	function displayCharacterData(character) {
		var characterDate = new Date(character.dateLastPlayed),
			weeklyReset = getDateOfMostRecentWeeklyReset(characterDate),
			dailyReset = getDateOfMostRecentDailyReset(characterDate);

		displayCurrentCharacterData();
		displayWeeklyCharacterData();
		displayDailyCharacterData();

		function displayCurrentCharacterData() {
			var tab = tabs.find('.current'),
				container = $('<div/>').addClass('character-container').appendTo(tab);

			buildBox(character.boxes.current.light).appendTo(container);

			$('<div/>')
				.addClass('timestamp-header')
				.text('Last played on ' + moment(characterDate).format('dddd MMMM D, YYYY H:mm'))
				.appendTo(container);

			buildBox(character.boxes.current.motes).appendTo(container);

			$.each(character.boxes.current.currencies, function(i, val) {
				buildBox(val).appendTo(container);
			});

			$.each(character.boxes.current.factions, function(i, val) {
				buildBox(val).appendTo(container);
			});

			$.each(character.boxes.current.activities, function(i, val) {
				buildBox(val).appendTo(container);
			});
		}

		function displayWeeklyCharacterData() {
			var tab = tabs.find('.weekly'),
				container = $('<div/>').addClass('character-container').appendTo(tab);

			buildBox(character.boxes.current.light).appendTo(container);

			$('<div/>')
				.addClass('timestamp-header')
				.text('Since weekly reset on ' + moment(weeklyReset).format('dddd MMMM D, YYYY H:mm'))
				.appendTo(container);

			buildBox(character.boxes.weekly.motes).appendTo(container);

			$.each(character.boxes.weekly.currencies, function(i, val) {
				buildBox(val).appendTo(container);
			});

			$.each(character.boxes.weekly.activities, function(i, val) {
				buildBox(val).appendTo(container);
			});

			$.each(character.boxes.weekly.factions, function(i, val) {
				buildBox(val).appendTo(container);
			});
		}

		function displayDailyCharacterData() {
			var tab = tabs.find('.daily'),
				container = $('<div/>').addClass('character-container').appendTo(tab);

			buildBox(character.boxes.current.light).appendTo(container);

			$('<div/>')
				.addClass('timestamp-header')
				.text('Since daily reset on ' + moment(dailyReset).format('dddd MMMM D, YYYY H:mm'))
				.appendTo(container);

			buildBox(character.boxes.daily.motes).appendTo(container);

			$.each(character.boxes.daily.currencies, function(i, val) {
				buildBox(val).appendTo(container);
			});

			$.each(character.boxes.daily.factions, function(i, val) {
				buildBox(val).appendTo(container);
			});
		}
	}

	function buildBox(data) {
		var box = $('<div/>')
				.addClass(data.isHeader? 'header-box' : userPrefs.progressType)
				.addClass(data.type)
				.prop('title',data.label),
			icon = $('<div/>')
				.addClass('icon'),
			progressbar = $('<div/>')
				.addClass('progress-bar'),
			amount = $('<div/>')
				.addClass('amount')
				.text(data.footer || (data.progress + '/' + data.max)),
			title = $('<div/>')
				.addClass('title')
				.html(data.title);

		var progressBarSize = (data.percentToNextLevel || data.progress/data.max*100 || 0) + '%';

		if(userPrefs.progressType === 'progress-box') {
			progressbar.height(progressBarSize);
		} else if(userPrefs.progressType === 'progress-horizontal') {
			progressbar.width(progressBarSize);
			progressbar = $('<div/>').addClass('progress-bar-container').append(progressbar);
		}

		if(data.subtitle) {
			$('<div/>')
				.addClass('subtitle')
				.text(data.subtitle)
				.appendTo(box);
		}

		if(data.iconPath) {
			icon.css('background-image', 'url(' + data.iconPath + ')');
		}

		if(data.backgroundPath) {
			box.css('background-image', 'url(' + data.backgroundPath + ')');
		}

		if(data.progressColor) {
			progressbar.css('background-color', data.progressColor);
		}

		if(data.link) {
			box.css('cursor','pointer');
			box.on('click', function() {
				open(data.link, '_blank');
			});
		}

		return box.append(icon, title, amount, progressbar);
	}

	function showMessage(msg) {
		if(!msg) {
			return;
		}
		if(typeof msg === 'string') {
			msg = {text:msg};
		}
		if(msg.level === 'info') {
			message.css('color','');
		} else {
			message.css('color','#a94442');
		}
		if(msg.text) {
			message.text(msg.text);
		} else {
			message.text('unknown error');
		}
	}

	function showError(err) {
		if(typeof err === 'string') {
			err = {text:err};
		}
		err.level = 'error';
		showMessage(err);
	}

	function updateHashFromForm() {
		window.location.hash = 'un=' + textInput.val() + '&t=' + selectedAccountType;
	}

	function updateFormFromHash() {
		var urlVars = getUrlVars();
		textInput.val(urlVars.un);
		if(urlVars.t) {
			selectedAccountType = parseInt(urlVars.t);
			$('input:radio[name=accountType][value=' + urlVars.t + ']').click();
		}
		if(urlVars.un && urlVars.t) {
			performSearch();
		}
	}

	button.on('click', function() {
		var username = textInput.val().replace(/\s/g, '');
		textInput.val(username);
		if(!username) {
			return;
		}
		updateHashFromForm();
	});

	$(window).on('hashchange', function() {
		updateFormFromHash();
	});

	$("input:radio[name=accountType]").click(function() {
    	selectedAccountType = parseInt($(this).val());
	});

	textInput.on('keypress', function(e) {
		if(e.keyCode === 13) {
			button.click();
		}
	});

	function scrollToDiv(div) {
		var pos = div.offset();
		pos.top -= parseInt($('.header').css('height'));
		scrollTo(pos.left, pos.top);
	}

	function setupNavigation() {
		var coolStuffDiv = $('.cool-stuff'),
		aboutDiv = $('.about'),
		contactDiv = $('.contact'),
		contributingDiv = $('.contributing'),
		navtabs = $('.nav-tabs li');

		$('.search-link').on('click', function() {
			scrollTo(0,0);
		});

		$('.cool-stuff-link').on('click', function() {
			scrollToDiv(coolStuffDiv);
		});

		$('.about-link').on('click', function() {
			scrollToDiv(aboutDiv);
		});

		$('.contact-link').on('click', function() {
			scrollToDiv(contactDiv);
		});

		$('.contributing-link').on('click', function() {
			scrollToDiv(contributingDiv);
		});

		navtabs.on('click', function() {
			var self = $(this);
			navtabs.removeClass('active');
			self.addClass('active');
			tabs.find('.tab').hide();
			tabs.find('.' + self.text().toLowerCase()).show();
		});
	}

	function loadUserPrefs() {
		var defaultPrefs = {
			progressType: 'progress-box'
		};
		userPrefs = JSON.parse(localStorage.getItem('userPrefs')) || defaultPrefs;
	}

	function storeUserPrefs() {
		localStorage.setItem('userPrefs', JSON.stringify(userPrefs));
	}

	$('.change-style').on('click', function() {
		userPrefs.progressType = progressStyleOptions[progressStyleOptions.indexOf(userPrefs.progressType) + 1] || progressStyleOptions[0];
		displayPlayerData();
		storeUserPrefs();
	});

	textInput.focus();
	setupNavigation();
	loadUserPrefs();
	updateFormFromHash();

});