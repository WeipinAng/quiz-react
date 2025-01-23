function Progress({ index, numQuestions, points, maxPossiblePoints }) {
    return (
        <header className="progress">
            <progress max={numQuestions} value={index} />

            <p>
                Question <strong>{index + 1}</strong> / {numQuestions}
            </p>

            <p>
                <strong>{points}</strong> / {maxPossiblePoints} points
            </p>
        </header>
    );
}

export default Progress;
