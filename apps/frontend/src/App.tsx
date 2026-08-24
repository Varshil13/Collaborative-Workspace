import { BrowserRouter, Route, Routes, useParams } from "react-router";
import "./App.css";
import { useEffect, useLayoutEffect, useState } from "react";

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

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3002");

    socket.onopen = () => {
      console.log("connected to websocker server");
      socket.send(JSON.stringify({ type: "join", boardId: boardId }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "initial_state") {
        setUsers(data.users);
      }

      if (data.type === "join") {
        setUsers((users) => [...users, data.userId]);
      }

      if (data.type === "leave") {
        setUsers((users) => users.filter((x) => x !== data.userId ));
      }
    };

    socket.onclose = () => {
      console.log("connection close");
    };

  }, [boardId]);

  return (
    <div>
      
      you are on board {boardId}
      currently active users : {users.map((user, idx) => <ul key={idx}> {user} </ul>)}
    </div>
  );
}

export default App;
