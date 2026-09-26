import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Send,
  MessageCircle,
} from "lucide-react";

import {
  getGroupMessages,
  sendGroupMessage,
} from "../api/groupChat";

import { useAuth } from "../contexts/AuthContext";


export default function GroupChat({
  group,
  onClose,
}) {

  const { user } =
    useAuth();


  const [
    messages,
    setMessages,
  ] = useState([]);


  const [
    text,
    setText,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    sending,
    setSending,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const messagesEndRef =
    useRef(null);


  /* =========================
     LOAD
  ========================= */

  async function loadMessages(
    showLoading = false
  ) {
    try {

      if (showLoading) {
        setLoading(true);
      }

      const data =
        await getGroupMessages(
          group.id
        );

      setMessages(data);

      setError("");

    } catch (err) {

      setError(
        err.message
      );

    } finally {

      setLoading(false);

    }
  }


  /* =========================
     INITIAL + POLLING
  ========================= */

  useEffect(() => {

    loadMessages(true);

    /*
      Пока MVP обновляем чат
      каждые 3 секунды.
    */

    const interval =
      setInterval(() => {
        loadMessages(false);
      }, 3000);


    return () => {
      clearInterval(interval);
    };

  }, [group.id]);


  /* =========================
     SCROLL
  ========================= */

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);


  /* =========================
     SEND
  ========================= */

  async function handleSend(
    event
  ) {

    event.preventDefault();

    const clean =
      text.trim();


    if (
      !clean ||
      sending
    ) {
      return;
    }


    try {

      setSending(true);
      setError("");


      const newMessage =
        await sendGroupMessage(
          group.id,
          clean
        );


      setMessages(
        (previous) => [
          ...previous,
          newMessage,
        ]
      );


      setText("");

    } catch (err) {

      setError(
        err.message
      );

    } finally {

      setSending(false);

    }
  }


  /* =========================
     RENDER
  ========================= */

  return (
    <main className="group-chat-page">

      <div className="group-chat-window">

        {/* HEADER */}

        <header className="group-chat-header">

          <button
            className="group-chat-back"
            onClick={onClose}
            aria-label="Назад"
          >

            <ArrowLeft
              size={20}
            />

          </button>


          <div className="group-chat-header-icon">

            <MessageCircle
              size={19}
            />

          </div>


          <div className="group-chat-header-info">

            <strong>
              {group.name}
            </strong>

            <span>
              {group.destination ||
                "Группа поездки"}

              {group.trip_date
                ? ` · ${String(
                    group.trip_date
                  ).slice(
                    0,
                    10
                  )}`
                : ""}
            </span>

          </div>

        </header>


        {/* MESSAGES */}

        <section className="group-chat-messages">

          {loading ? (

            <div className="group-chat-state">
              Загрузка сообщений...
            </div>

          ) : messages.length ===
            0 ? (

            <div className="group-chat-state">

              <div className="group-chat-empty-icon">
                <MessageCircle
                  size={38}
                />
              </div>

              <strong>
                Пока сообщений нет
              </strong>

              <span>
                Начните общение
                с участниками группы
              </span>

            </div>

          ) : (

            messages.map(
              (item) => {

                const isMine =
                  Number(
                    item.user_id
                  ) ===
                  Number(
                    user?.id
                  );


                return (
                  <div
                    key={item.id}
                    className={
                      `group-message ${
                        isMine
                          ? "mine"
                          : "other"
                      }`
                    }
                  >

                    {!isMine && (
                      <div className="group-message-author">
                        {item.user_name}
                      </div>
                    )}


                    <div className="group-message-bubble">
                      {item.message}
                    </div>


                    <div className="group-message-time">

                      {new Date(
                        item.created_at
                      ).toLocaleTimeString(
                        "ru-RU",
                        {
                          hour:
                            "2-digit",
                          minute:
                            "2-digit",
                        }
                      )}

                    </div>

                  </div>
                );

              }
            )

          )}


          <div
            ref={messagesEndRef}
          />

        </section>


        {/* ERROR */}

        {error && (

          <div className="group-chat-error">
            {error}
          </div>

        )}


        {/* INPUT */}

        <form
          className="group-chat-input"
          onSubmit={
            handleSend
          }
        >

          <input
            value={text}
            onChange={(event) =>
              setText(
                event.target.value
              )
            }
            placeholder="Написать сообщение..."
            maxLength={1000}
            autoComplete="off"
          />


          <button
            type="submit"
            disabled={
              !text.trim() ||
              sending
            }
            aria-label="Отправить"
          >

            <Send
              size={18}
            />

          </button>

        </form>

      </div>

    </main>
  );
}