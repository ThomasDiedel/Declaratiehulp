import React, { useState, useEffect } from "react";
import PathSelector from "./components/PathSelector";
import QuestionStep from "./components/QuestionStep";
import ResultDisplay from "./components/ResultDisplay";
import DeclaratieTabel from "./components/DeclaratieTabel";
// ProgressBar blijft aanwezig, maar geen styling aanpassingen volgens wens
import ProgressBar from "./components/ProgressBar";
import { paths } from "./data/paths";
import { calculateResult } from "./calculateResult";

const containerStyle = {
  padding: "24px",
  maxWidth: "700px",
  margin: "auto",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  fontSize: "18px",
  lineHeight: "1.6",
  color: "#222",
};

const backButtonStyle = (disabled) => ({
  marginTop: "1.5rem",
  padding: "1rem 1.5rem",
  borderRadius: "8px",
  border: "1px solid #ccc",
  backgroundColor: disabled ? "#f0f0f0" : "#f0f4ff",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.5 : 1,
});

export default function App() {
  const [path, setPath] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState("");
  const [resultCode, setResultCode] = useState(null);

  useEffect(() => {
    setSelectedAnswer(null);
  }, [step]);

  const handleAnswer = (answer) => {
    const strippedAnswer = answer.replace("✅ ", "").replace("❌ ", "");
    const updatedAnswers = [...answers, strippedAnswer];
    setSelectedAnswer(answer);
    setAnswers(updatedAnswers);

    const currentSteps = paths[path];

    if (
      path === "Consult" &&
      step === 4 &&
      (strippedAnswer === "Telefonisch consult" ||
        strippedAnswer === "E-consult")
    ) {
      finalizeResult(updatedAnswers, strippedAnswer);
      return;
    }

    if (path === "Consult" && step === 5 && strippedAnswer === "Nee") {
      if (step + 2 >= currentSteps.length) {
        finalizeResult(updatedAnswers, strippedAnswer);
      } else {
        setStep(step + 2);
      }
      return;
    }

    if (step === currentSteps.length - 1) {
      finalizeResult(updatedAnswers, strippedAnswer);
    } else {
      setStep(step + 1);
    }
  };

  const finalizeResult = (answers, lastAnswer) => {
    const { res, code } = calculateResult(path, answers, lastAnswer);
    setResult(res);
    setResultCode(code);
  };

  const reset = () => {
    setPath("");
    setStep(0);
    setAnswers([]);
    setResult("");
    setSelectedAnswer(null);
    setResultCode(null);
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        🯪 Declaratiehulp Huisartsenzorg
      </h1>

      {!path ? (
        <>
          <PathSelector paths={paths} onSelect={setPath} />
          <DeclaratieTabel resultCode={resultCode} />
        </>
      ) : !result ? (
        <>
          <button
            onClick={() => {
              if (step === 0) return;
              setStep((s) => s - 1);
              setAnswers((prev) => prev.slice(0, -1));
              setSelectedAnswer(null);
            }}
            disabled={step === 0}
            style={backButtonStyle(step === 0)}
            aria-label="Ga terug naar vorige vraag"
          >
            ⬅ Terug
          </button>

          <ProgressBar currentStep={step + 1} totalSteps={paths[path].length} />

          <QuestionStep
            step={step}
            question={paths[path][step].question}
            tooltip={paths[path][step].tooltip}
            options={paths[path][step].options}
            onAnswer={handleAnswer}
            selected={selectedAnswer}
          />
        </>
      ) : (
        <>
          <ResultDisplay result={result} onReset={reset} />
          <DeclaratieTabel resultCode={resultCode} />
        </>
      )}
    </div>
  );
}
