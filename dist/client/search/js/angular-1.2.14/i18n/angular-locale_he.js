"use strict";angular.module("ngLocale",[],["$provide",function(a){var b={ZERO:"zero",ONE:"one",TWO:"two",FEW:"few",MANY:"many",OTHER:"other"};a.value("$locale",{DATETIME_FORMATS:{AMPMS:["לפנה״צ","אחה״צ"],DAY:["יום ראשון","יום שני","יום שלישי","יום רביעי","יום חמישי","יום שישי","יום שבת"],MONTH:["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"],SHORTDAY:["יום א׳","יום ב׳","יום ג׳","יום ד׳","יום ה׳","יום ו׳","שבת"],SHORTMONTH:["ינו","פבר","מרץ","אפר","מאי","יונ","יול","אוג","ספט","אוק","נוב","דצמ"],fullDate:"EEEE, d בMMMM y",longDate:"d בMMMM y",medium:"d בMMM yyyy HH:mm:ss",mediumDate:"d בMMM yyyy",mediumTime:"HH:mm:ss","short":"dd/MM/yy HH:mm",shortDate:"dd/MM/yy",shortTime:"HH:mm"},NUMBER_FORMATS:{CURRENCY_SYM:"₪",DECIMAL_SEP:".",GROUP_SEP:",",PATTERNS:[{gSize:3,lgSize:3,macFrac:0,maxFrac:3,minFrac:0,minInt:1,negPre:"-",negSuf:"",posPre:"",posSuf:""},{gSize:3,lgSize:3,macFrac:0,maxFrac:2,minFrac:2,minInt:1,negPre:"-",negSuf:" ¤",posPre:"",posSuf:" ¤"}]},id:"he",pluralCat:function(a){return 1==a?b.ONE:b.OTHER}})}]);