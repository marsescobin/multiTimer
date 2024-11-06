import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [timers, setTimers] = useState(() => {
    const savedTimers = localStorage.getItem("timers");
    if (savedTimers) {
      const parsedTimers = JSON.parse(savedTimers);
      parsedTimers.forEach((timer) => {
        if (timer.isRunning) {
          const intervalId = setInterval(() => {
            setTimers((prevTimers) => {
              return prevTimers.map((t) => {
                if (t.id === timer.id && t.timeLeft > 0) {
                  return { ...t, timeLeft: t.timeLeft - 1 };
                } else if (t.id === timer.id && t.timeLeft === 0) {
                  clearInterval(intervalId);
                  return { ...t, isRunning: false };
                }
                return t;
              });
            });
          }, 1000);
          timer.intervalId = intervalId;
        }
      });
      return parsedTimers;
    }
    return [];
  });
  const [formData, setFormData] = useState({
    studentName: "",
    examName: "",
    duration: "",
  });

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimers([
      ...timers,
      {
        ...formData,
        id: Date.now(),
        isRunning: false,
        timeLeft: formData.duration * 60,
      },
    ]);
    setShowForm(false);
    setFormData({ studentName: "", examName: "", duration: "" });
  };

  const handleStart = (id) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => {
        if (timer.id === id) {
          const intervalId = setInterval(() => {
            setTimers((prevTimers) => {
              return prevTimers.map((t) => {
                if (t.id === id && t.timeLeft > 0) {
                  return { ...t, timeLeft: t.timeLeft - 1 };
                } else if (t.id === id && t.timeLeft === 0) {
                  clearInterval(intervalId);
                  return { ...t, isRunning: false };
                }
                return t;
              });
            });
          }, 1000);

          return { ...timer, isRunning: true, intervalId };
        }
        return timer;
      })
    );
  };

  const handleClearAll = () => {
    timers.forEach((timer) => {
      if (timer.intervalId) {
        clearInterval(timer.intervalId);
      }
    });
    setTimers([]);
  };

  const handlePause = (id) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => {
        if (timer.id === id) {
          if (timer.intervalId) {
            clearInterval(timer.intervalId);
          }
          return { ...timer, isRunning: false, intervalId: null };
        }
        return timer;
      })
    );
  };

  const handleDelete = (id) => {
    setTimers((prevTimers) => {
      const timerToDelete = prevTimers.find((timer) => timer.id === id);
      if (timerToDelete?.intervalId) {
        clearInterval(timerToDelete.intervalId);
      }
      return prevTimers.filter((timer) => timer.id !== id);
    });
  };

  useEffect(() => {
    localStorage.setItem("timers", JSON.stringify(timers));
  }, [timers]);

  return (
    <div className="container">
      <h1>EJ's Multi-timer App</h1>
      <div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Add a timer
        </button>
        {timers.length > 0 && (
          <button className="btn-danger" onClick={handleClearAll}>
            Delete all timers
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Student Name"
            value={formData.studentName}
            onChange={(e) =>
              setFormData({ ...formData, studentName: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Exam Name"
            value={formData.examName}
            onChange={(e) =>
              setFormData({ ...formData, examName: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            required
          />
          <button type="submit">Submit</button>
        </form>
      )}

      {timers.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Exam</th>
              <th>Duration</th>
              <th>Action</th>
              <th>Time Left</th>
            </tr>
          </thead>
          <tbody>
            {timers.map((timer) => (
              <tr key={timer.id}>
                <td>{timer.studentName}</td>
                <td>{timer.examName}</td>
                <td>{timer.duration} minutes</td>
                <td>
                  {!timer.isRunning ? (
                    <>
                      <button
                        className={
                          timer.timeLeft === timer.duration * 60
                            ? "btn-success"
                            : "btn-primary"
                        }
                        onClick={() => handleStart(timer.id)}
                      >
                        {timer.timeLeft === timer.duration * 60
                          ? "Start"
                          : "Resume"}
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(timer.id)}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn-warning"
                        onClick={() => handlePause(timer.id)}
                      >
                        Pause
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(timer.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
                <td
                  style={{ color: timer.timeLeft <= 300 ? "red" : "inherit" }}
                >
                  {timer.isRunning || timer.timeLeft < timer.duration * 60
                    ? formatTime(timer.timeLeft)
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
