import { useEffect, useReducer } from "react";
import { STATUS_CODES } from "../enums";
import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";

const initialState = {
    questions: [],
    status: STATUS_CODES.Loading,
    index: 0,
    answer: null,
    points: 0,
    highscore: 0,
};

function reducer(state, action) {
    switch (action.type) {
        case "dataReceived":
            return {
                ...state,
                questions: action.payload,
                status: STATUS_CODES.Ready,
            };
        case "dataFailed":
            return { ...state, status: STATUS_CODES.Error };
        case "start":
            return { ...state, status: STATUS_CODES.Active };
        case "newAnswer":
            const question = state.questions.at(state.index);

            return {
                ...state,
                answer: action.payload,
                points:
                    action.payload === question.correctOption
                        ? state.points + question.points
                        : state.points,
            };
        case "nextQuestion":
            return { ...state, index: state.index + 1, answer: null };
        case "finish":
            return {
                ...state,
                status: STATUS_CODES.Finished,
                highscore:
                    state.points > state.highscore
                        ? state.points
                        : state.highscore,
            };
        case "restart":
            return {
                ...initialState,
                questions: state.questions,
                status: STATUS_CODES.Ready,
            };

        default:
            throw new Error("Action unknown");
    }
}

export default function App() {
    const [{ questions, status, index, answer, points, highscore }, dispatch] =
        useReducer(reducer, initialState);

    const numQuestions = questions.length;
    const maxPossiblePoints = questions.reduce(
        (prev, cur) => prev + cur.points,
        0
    );

    useEffect(function () {
        fetch("http://localhost:9000/questions")
            .then((res) => res.json())
            .then((data) => dispatch({ type: "dataReceived", payload: data }))
            .catch((err) => dispatch({ type: "dataFailed" }));
    }, []);

    return (
        <div className="app">
            <Header />

            <Main>
                {status === STATUS_CODES.Loading && <Loader />}
                {status === STATUS_CODES.Error && <Error />}
                {status === STATUS_CODES.Ready && (
                    <StartScreen
                        numQuestions={numQuestions}
                        dispatch={dispatch}
                    />
                )}
                {status === STATUS_CODES.Active && (
                    <>
                        <Progress
                            index={index}
                            numQuestions={numQuestions}
                            points={points}
                            maxPossiblePoints={maxPossiblePoints}
                            answer={answer}
                        />
                        <Question
                            question={questions[index]}
                            dispatch={dispatch}
                            answer={answer}
                        />
                        <NextButton
                            dispatch={dispatch}
                            answer={answer}
                            index={index}
                            numQuestions={numQuestions}
                        />
                    </>
                )}
                {status === STATUS_CODES.Finished && (
                    <FinishScreen
                        points={points}
                        maxPossiblePoints={maxPossiblePoints}
                        highscore={highscore}
                        dispatch={dispatch}
                    />
                )}
            </Main>
        </div>
    );
}
