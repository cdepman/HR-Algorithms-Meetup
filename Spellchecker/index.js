var path = require("path");
var fs = require("fs");
var corpus = String(fs.readFileSync(path.join(__dirname, "./corpus")));
console.log("\nInitializing spellchecker!\n");

/*
  Returns an object with each unique word in the input as a key,
  and the count of the number of occurances of that word as the value.
  (HINT: the code `text.toLowerCase().match(/[a-z]+/g)` will return an array
  of all lowercase words in the string.)
*/
function getWordCounts(text) {
  var wordsCount = {};
  var words = text.toLowerCase().match(/[a-z]+/g);
  for (var i = 0; i < words.length; i++) {
    if (!wordsCount.hasOwnProperty(words[i])) {
      wordsCount[words[i]] = 0;
    }
    wordsCount[words[i]]++;
  }
  return wordsCount;
}

var WORD_COUNTS = getWordCounts(corpus);
var alphabet = "abcdefghijklmnopqrstuvwxyz";

/*
  Returns the set of all strings 1 edit distance away from the input word.
  This consists of all strings that can be created by:
    - Adding any one character (from the alphabet) anywhere in the word.
    - Removing any one character from the word.
    - Transposing (switching) the order of any two adjacent characters in a word.
    - Substituting any character in the word with another character.
*/
function editDistance1(word) {
  var results = {};
  var word = word.split('');
  // at each position in the input word, inserts the next letter of of the alphabet and stores it
  var addChar = function(word) {
    for (var i = 0; i <= word.length; i++) {
      for (var alphaIndex = 0; alphaIndex < alphabet.length; alphaIndex++) {
        var newWord = word.slice(0,i).concat(alphabet[alphaIndex], word.slice(i));
        results[newWord.join('')] = true;
      }      
    }
  }
  // at each position of the input word, removes that letter and stores it
  var removeChar = function(word) {
    for (var i = 0; i < word.length; i++) {
      var newWord = word.slice(0,i).concat(word.slice(i+1));
      results[newWord.join('')] = true;
    }
  }
  // for each adjacent characters in the input word, switches the two and stores the result
  var transpose = function(word) {
    for (var i = 0; i < word.length; i++) {
      var newWord = word.slice(0);
      var switchChar1 = word[i];
      var switchChar2 = word[i+1];
      newWord[i] = switchChar2;
      newWord[i+1] = switchChar1;
      results[newWord.join('')] = true; 
    }
  }
  var substitute = function(word) {
    for (var i = 0; i < word.length; i++) {
      for (var alphaIndex = 0; alphaIndex < alphabet.length; alphaIndex++) {
        var newWord = word.slice(0,i).concat(alphabet[alphaIndex], word.slice(i+1));
        results[newWord.join('')] = true;
      }      
    }
  }

  addChar(word);
  removeChar(word);
  transpose(word);
  substitute(word);

  return results;
}


/* Given a word, attempts to correct the spelling of that word.
  - First, if the word is a known word, return the word.
  - Second, if the word has any known words edit-distance 1 away, return the one with
    the highest frequency, as recorded in NWORDS.
  - Third, if the word has any known words edit-distance 2 away, return the one with
    the highest frequency, as recorded in NWORDS. (HINT: what does applying
    "editDistance1" *again* to each word of its own output do?)
  - Finally, if no good replacements are found, return the word.
*/

function knownEditDistanceWords(editDistanceWords) {
  result = {};
  for (word in editDistanceWords) {
    if (WORD_COUNTS.hasOwnProperty(word)){
      result[word] = true;
    }
  }
  return result;
}


function correct(word) {
  if (WORD_COUNTS.hasOwnProperty(word)) {
    return word;
  } else {
    var editDistance1Words = editDistance1(word);
    var knownEditDistance1Words = knownEditDistanceWords(editDistance1Words);
    highestFreqWord = word;
    highestFreqWordCount = 0;
    if (Object.keys(knownEditDistance1Words).length !== 0) {
      for (var legalEditDistance1Word in knownEditDistance1Words) {    
        if (WORD_COUNTS[legalEditDistance1Word] > highestFreqWordCount) {
          highestFreqWord = legalEditDistance1Word;
          highestFreqWordCount = WORD_COUNTS[legalEditDistance1Word];
        }
      }
    } else {
      editDistance2 = function (editDistance1Words) {
        editDistance2Results = {};
        for (word in editDistance1Words) {
          var editDistance2Words = editDistance1(word);
          for (editDistance2Word in editDistance2Words) {
            editDistance2Results[editDistance2Word] = true;
          }
        }
        return editDistance2Results;
      }
      var knownEditDistance2Words = knownEditDistanceWords(editDistance2(editDistance1Words));
      for (word in knownEditDistance2Words) {
        if (WORD_COUNTS[word] > highestFreqWordCount) {
          highestFreqWord = word;
          highestFreqWordCount = WORD_COUNTS[word];
        }
      }
    }
  }
  return highestFreqWord;
}

/*
  This script runs your spellchecker on every input you provide.
*/
var inputWords = process.argv.slice(2);
var output = inputWords.map(function(word) {
  var correction = correct(word);
  if (correction === word) {
    return " - " + word + " is spelled correctly.";
  } else if (typeof correction === "undefined") {
    return " - " + word + " didn't get any output from the spellchecker.";
  } else {
    return " - " + word + " should be spelled as " + correction + ".";
  }
});
console.log(output.join("\n\n"));
console.log("\nFinished!");





