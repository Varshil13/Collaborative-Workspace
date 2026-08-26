import { BrowserRouter, Route, Routes, useParams } from "react-router";
import { useEffect, useState } from "react";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/board/:boardId" element={<Board />} />
      </Routes>
    </BrowserRouter>
  );
}

function Board() {
  const { boardId } = useParams();
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3002");
    setSocket(socket);

    socket.onopen = () => {
      console.log("connected to websocket server");

      socket.send(
        JSON.stringify({
          type: "join",
          boardId: boardId,
        }),
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "initial_state") {
        setUsers(data.users);
        setIssues(data.issues);
      }

      if (data.type === "join") {
        setUsers((users) => [...users, data.userId]);
      }

      if (data.type === "addedIssue") {
        setIssues(data.issues);
      }

      if (data.type === "deletedIssue") {
        setIssues(data.issues);
      }

      if (data.type === "leave") {
        setUsers((users) => users.filter((x) => x !== data.userId));
      }
    };

    socket.onclose = () => {
      console.log("connection closed");
    };

    return () => {
      socket.close();
    };
  }, []);

  function renderIssues(sectionId) {
    return issues
      .filter((issue) => issue.sectionId === sectionId)
      .map((issue) => {
        return (
          <Card
            key={issue.id}
            title={issue.title}
            sectionId={sectionId}
            issue={issue}
          />
        );
      });
  }

  function Card({ title, sectionId, issue }) {
    return (
      <div className="group flex items-center justify-between border-b border-gray-200 bg-white px-3 py-3 hover:bg-gray-50">
        <h4 className="min-w-0 flex-1 truncate text-sm text-gray-800">
          {title}
        </h4>

        <Deletebutton sectionId={sectionId} issue={issue} />
      </div>
    );
  }

  function Deletebutton({ issue, sectionId }) {
    return (
      <button
        className="ml-3 text-xs text-gray-400 opacity-0 transition hover:text-red-500 group-hover:opacity-100"
        onClick={() => {
          socket.send(
            JSON.stringify({
              type: "deleteissue",
              sectionId: sectionId,
              issue: issue,
              boardId: boardId,
            }),
          );
        }}
      >
        Delete
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-base font-semibold">Board</h1>

            <p className="mt-0.5 text-xs text-gray-400">{boardId}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{users.length} active</span>
            <div className="flex -space-x-1">
              {users.map((user, idx) => (
                <div
                  key={idx}
                  title={user}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[10px] font-medium text-gray-600"
                >
                  {typeof user === "string"
                    ? user.charAt(0).toUpperCase()
                    : user.userId?.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Backlog */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-gray-700">Backlog</h2>

                <span className="text-xs text-gray-400">
                  {
                    issues.filter((issue) => issue.sectionId === "Backlog")
                      .length
                  }
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
              <div className="flex border-b border-gray-200">
                <input
                  type="text"
                  id="backlogissuetitle"
                  placeholder="Add an issue..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-gray-400"
                />

                <button
                  className="border-l border-gray-200 px-3 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  onClick={() => {
                    const title =
                      document.getElementById("backlogissuetitle").value;
                    if (title.trim() != "") {
                      socket.send(
                        JSON.stringify({
                          type: "addIssue", 
                          boardId: boardId,
                          sectionId: "Backlog",
                          title: title,
                        }),
                      );
                    }
                  }}
                >
                  Add
                </button>
              </div>

              <div>{renderIssues("Backlog")}</div>
            </div>
          </section>

          {/* Working */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-gray-700">Working</h2>

                <span className="text-xs text-gray-400">
                  {
                    issues.filter((issue) => issue.sectionId === "Working")
                      .length
                  }
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
              <div className="flex border-b border-gray-200">
                <input
                  type="text"
                  id="workingissuetitle"
                  placeholder="Add an issue..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-gray-400"
                />

                <button
                  className="border-l border-gray-200 px-3 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  onClick={() => {
                    const title =
                      document.getElementById("workingissuetitle").value;

                    socket.send(
                      JSON.stringify({
                        type: "addIssue",
                        boardId: boardId,
                        sectionId: "Working",
                        title: title,
                      }),
                    );
                  }}
                >
                  Add
                </button>
              </div>

              <div>{renderIssues("Working")}</div>
            </div>
          </section>

          {/* Done */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-gray-700">Done</h2>

                <span className="text-xs text-gray-400">
                  {issues.filter((issue) => issue.sectionId === "Done").length}
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
              <div className="flex border-b border-gray-200">
                <input
                  type="text"
                  id="doneissuetitle"
                  placeholder="Add an issue..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-gray-400"
                />

                <button
                  className="border-l border-gray-200 px-3 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  onClick={() => {
                    const title =
                      document.getElementById("doneissuetitle").value;

                    socket.send(
                      JSON.stringify({
                        type: "addIssue",
                        boardId: boardId,
                        sectionId: "Done",
                        title: title,
                      }),
                    );
                  }}
                >
                  Add
                </button>
              </div>

              <div>{renderIssues("Done")}</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
