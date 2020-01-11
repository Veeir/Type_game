import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

//Top level
class App extends React.Component {
    constructor(props) {
        super(props);
        const race = "This is a test race.";
        const raceArray = race.split(" ");
        this.state = {
            currentRace: race,
            currentRaceArray: raceArray,
            currentWord: raceArray[0],
            currentWordIndex: 0,
            currentIndex: 0,
            wordCount: raceArray.length,
            raceHighlightArray: Array(race.length).fill(0),
            raceActive: false,
            elapsedTime: 0,
            wpm: 0
        };
        this.backspace = this.backspace.bind(this);
        this.validInput = this.validInput.bind(this);
        this.invalidInput = this.invalidInput.bind(this);
        this.wordFinished = this.wordFinished.bind(this);
        this.checkRaceFinished = this.checkRaceFinished.bind(this);
        this.loadNewRace = this.loadNewRace.bind(this);
        this.startWpmTimer = this.startWpmTimer.bind(this);
        this.stopWpmTimer = this.stopWpmTimer.bind(this);
    }

    backspace() {
        let raceHighlightArray = this.state.raceHighlightArray;
        raceHighlightArray[this.state.currentIndex - 1] = 0;
        this.setState((state) => (
            {
                currentIndex: state.currentIndex - 1,
                raceHighlightArray: raceHighlightArray
            }
        ));
    }

    validInput() {
        let raceHighlightArray = this.state.raceHighlightArray;
        raceHighlightArray[this.state.currentIndex] = 1;
        this.setState((state) => (
            {
                currentIndex: state.currentIndex + 1,
                raceHighlightArray: raceHighlightArray
            }
        ), this.checkRaceFinished());
    }

    invalidInput() {
        let raceHighlightArray = this.state.raceHighlightArray;
        raceHighlightArray[this.state.currentIndex] = 2;
        this.setState((state) => (
            {
                currentIndex: state.currentIndex + 1,
                raceHighlightArray: raceHighlightArray
            }
        ));
    }

    wordFinished() {
        const currentWordIndex = this.state.currentWordIndex;

        this.setState((state) => (
            {
                currentWord: state.currentRaceArray[currentWordIndex + 1],
                currentWordIndex: this.state.currentWordIndex + 1,
                wpm: (Math.round((currentWordIndex / state.elapsedTime) * 60))
            }
        ));
    }

    checkRaceFinished() {
        const raceLength = this.state.currentRace.length;
        const index = this.state.currentIndex;

        if(raceLength-1 === index) {
            this.setState(
                {
                    raceActive: false
                }, this.stopWpmTimer);
        }
    }

    loadNewRace(newRace) {
        let currentRace = this.state.currentRace;
        let raceArray = this.state.currentRaceArray;
        let currentWord = this.state.currentRaceArray[0];
        let wordCount = this.state.wordCount;
        const raceHighlightArray = Array(this.state.currentRace.length).fill(0);

        if (newRace === "true") {
            const newRaceObj = races[Math.floor(Math.random()*races.length)]
            currentRace = newRaceObj.race;
            raceArray = currentRace.split(" ");
            currentWord = raceArray[0];
            wordCount = raceArray.length;
        }

        this.setState({
            currentRace: currentRace,
            currentRaceArray: raceArray,
            currentWord: currentWord,
            currentWordIndex: 0,
            currentIndex: 0,
            wordCount: wordCount,
            raceHighlightArray: raceHighlightArray,
            raceActive: true,
            wpm: 0
        }, this.startWpmTimer);
    }

    startWpmTimer() {
        const startTime = Date.now();
        this.timer = setInterval(() => {
            this.setState({elapsedTime: Math.floor((Date.now() - startTime) / 1000)});
          }, 1000);
    }

    stopWpmTimer() {
        clearInterval(this.timer);
        this.setState(
            {elapsedTime: 0}
        );
    }

    render(){
        console.log(this.state.raceHighlightArray);
        console.log("CW:" + this.state.currentWord);
        console.log(this.state.currentIndex);
        console.log(this.state.elapsedTime);
        return (
            <div className="raceWigit">
                {this.state.raceActive ? (
                    <RaceView 
                        race={this.state.currentRace}
                        highlight={this.state.raceHighlightArray}
                        currentIndex={this.state.currentIndex}
                        currentWord={this.state.currentWord}
                        wpm={this.state.wpm}
                        backspace={this.backspace}
                        validInput={this.validInput}
                        invalidInput={this.invalidInput}
                        wordFinished={this.wordFinished}
                    />
                ) : (
                    <SummaryView
                        wpm={this.state.wpm}
                        loadNewRace={this.loadNewRace}
                    />   
                )} 
                </div>            
        );
    }
}

function RaceView(props) {
    return (
        <div>
            <Race 
                race={props.race}
                highlight={props.highlight}
                currentIndex={props.currentIndex}
            />
            <Input 
                currentWord={props.currentWord}
                backspace={props.backspace}
                validInput={props.validInput}
                invalidInput={props.invalidInput}
                wordFinished={props.wordFinished}
            />
            <Counter 
                wpm={props.wpm}
            />
        </div>
    );
}

class SummaryView extends React.Component {

    newRace = (event) => {
        this.props.loadNewRace(event.target.value);
    }

    render() {
        return (
            <div>
                <p>WPM: {this.props.wpm}</p>
                <button onClick={this.newRace} value={"true"} >New Race</button>
                <button onClick={this.newRace} value={"false"} >Try Again</button>
            </div>
        );
    }
}

class Race extends React.Component {
    constructor(props) {
        super(props);
        this.createRaceSpans = this.createRaceSpans.bind(this);
    }

    createRaceSpans() {
        const highlight = this.props.highlight;
        const race = this.props.race.split("");
        const colorKey = ['blank', 'correct', 'incorrect'];

        const raceSpans = race.map((char, index) =>
            <span className={colorKey[highlight[index]]}>{char}</span>
        );
        return raceSpans;
    }

    render() {
        return(
            <div className="race">
                <p>
                    {this.createRaceSpans()}
                </p>
            </div>
        );
    }
}

class Input extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputWord: "",
            backspaceOccured: false,
            eventOccured: false
        };
        this.inputHandler = this.inputHandler.bind(this);
    }

    inputHandler(event) {
        const backspaceEventOccured = checkBackSpaceEvent(event.target.value, this.state.inputWord);
        event.persist();
        this.setState(() => ({
            inputWord: event.target.value,
            backspaceOccured: backspaceEventOccured,
            eventOccured: true
        }));
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextState !== this.state);
    }

    componentDidUpdate(){
        const currentWord = this.props.currentWord;
        const inputWord = this.state.inputWord;
        const backspaceOccured = this.state.backspaceOccured;

        if (this.shouldComponentUpdate()){
            if (backspaceOccured) {
                this.props.backspace();
            }else if (inputWord === currentWord + " ") {
                this.props.wordFinished();
                this.setState({inputWord: ""});
            }else if (!wordsMatching(inputWord, currentWord)) {
                this.props.invalidInput();
            }else {
                this.props.validInput();
            }
        }
    }

    component

    render() {
        return (
            <div className="input">
                <form>
                    <input className="inputForm" type="text" value={this.state.inputWord} onChange={this.inputHandler}/>
                </form>
            </div>
        );
    }
}

class Counter extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div>WPM: {this.props.wpm}</div>
        );
    }
}


ReactDOM.render(<App />, document.getElementById('root'));

//Helper Functions
function checkBackSpaceEvent(eventWord, inputWord) {
    return ((eventWord.length + 1) === inputWord.length);
}

function wordsMatching(inputWord, currentWord) {
    const minWordLength = inputWord.length; //Math.min(inputWord.length, currentWord.length);
    return inputWord.substring(0, minWordLength) === currentWord.substring(0, minWordLength);
}

const races = [
    {
        "race": "This is a test race.",
        "length":  20
    },

    {
        "race": "I need an easy friend, I do with an ear to lend, I do think you fit this shoe, I do, won't you have a clue?",
        "length":  107
    },

    {
        "race": "Down in a hole and they've put all the stones in their place, I've eaten the sun so my tongue has been burned of the taste, I have been guilty of kicking myself in the teeth, I will speak no more of my feelings beneath",
        "length":  208
    },

    {
        "race": "Into the flood again, Same old trip it was back then, So I made a big mistake, Try to see it once my way.",
        "length":  105
    },

    {
        "race": "I dream about how it's going to end, Approaching me quickly. Leaving a life of fear, I only want my mind to be clear.",
        "length":  117
    },

    {
        "race": "And I don't understand why I sleep all day, And I start to complain that there's no rain, And all I can do is read a book to stay awake, And it rips my life away but it's a great escape.",
        "length":  186
    },

    {
        "race": "I wish that i could turn back time, 'cause now the guilt is all mine. I can't live without the trust from those you love.",
        "length":  121
    }
]


