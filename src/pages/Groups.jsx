import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Compass,
  MapPin,
  Users,
  CalendarDays,
  UserPlus,
  MessageCircle,
} from "lucide-react";

import {
  getGroups,
  createGroup,
  joinGroup,
} from "../api/groups";

import GroupChat from "../components/GroupChat";


function Groups() {
  const [groups, setGroups] = useState([]);

  const [name, setName] = useState("");
  const [destination, setDestination] =
    useState("");
  const [date, setDate] = useState("");
  const [maxMembers, setMaxMembers] =
    useState("6");

  const [showCreate, setShowCreate] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [smartTrip, setSmartTrip] =
    useState(null);

  /*
    Какая группа сейчас открыта
    в чате.
  */
  const [chatGroup, setChatGroup] =
    useState(null);


  /* =========================
     SMART TRIP
  ========================= */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "mangystau_go_group_place"
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        setSmartTrip(parsed);

        if (parsed.name) {
          setDestination(
            parsed.name
          );
        }
      }
    } catch (error) {
      console.error(
        "SMART TRIP DATA ERROR:",
        error
      );
    }
  }, []);


  /* =========================
     LOAD GROUPS
  ========================= */

  async function loadGroups() {
    try {
      setLoading(true);

      const data =
        await getGroups();

      setGroups(data);
    } catch (error) {
      console.error(error);

      setMessage(
        "Не удалось загрузить группы"
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadGroups();
  }, []);


  /* =========================
     FILTER
  ========================= */

  const filteredGroups =
    useMemo(() => {
      if (!smartTrip?.name) {
        return groups;
      }

      const matching =
        groups.filter(
          (group) =>
            group.destination
              ?.toLowerCase() ===
            smartTrip.name
              ?.toLowerCase()
        );

      const other =
        groups.filter(
          (group) =>
            group.destination
              ?.toLowerCase() !==
            smartTrip.name
              ?.toLowerCase()
        );

      return [
        ...matching,
        ...other,
      ];
    }, [groups, smartTrip]);


  /* =========================
     CREATE GROUP
  ========================= */

  async function handleCreate() {
    if (
      !name.trim() ||
      !destination
    ) {
      setMessage(
        "Заполните название и направление"
      );

      return;
    }

    try {
      await createGroup({
        name: name.trim(),
        destination,
        trip_date:
          date || null,
        max_members:
          Number(maxMembers),
      });

      setName("");
      setDestination("");
      setDate("");
      setMaxMembers("6");

      setShowCreate(false);

      setMessage(
        "Группа успешно создана"
      );

      await loadGroups();
    } catch (error) {
      console.error(error);

      setMessage(
        error.message ||
          "Не удалось создать группу"
      );
    }
  }


  /* =========================
     JOIN GROUP
  ========================= */

  async function handleJoin(id) {
    try {
      const result = await joinGroup(id);

      setMessage(result.message || "Вы присоединились к группе");

      await loadGroups();

      // После успешного вступления сразу открываем чат.
      const joinedGroup = groups.find(
        (group) => Number(group.id) === Number(id)
      );

      if (joinedGroup) {
        setChatGroup({
          ...joinedGroup,
          is_member: true,
        });
      }
    } catch (error) {
      console.error(error);

      // Сервер сообщает, что пользователь уже состоит в группе.
      // Это не ошибка для интерфейса: просто открываем чат.
      if (
        error.message === "Вы уже состоите в этой группе" ||
        error.message?.toLowerCase().includes("уже состоите")
      ) {
        await loadGroups();

        const existingGroup = groups.find(
          (group) => Number(group.id) === Number(id)
        );

        if (existingGroup) {
          setChatGroup({
            ...existingGroup,
            is_member: true,
          });
        } else {
          setMessage("Вы уже состоите в этой группе. Откройте чат.");
        }

        return;
      }

      setMessage(
        error.message ||
          "Не удалось присоединиться к группе"
      );
    }
  }


  /* =========================
     CLEAR SMART TRIP
  ========================= */

  function clearSmartTrip() {
    localStorage.removeItem(
      "mangystau_go_group_place"
    );

    setSmartTrip(null);
  }


  /* =========================
     OPEN CHAT
  ========================= */

  function openChat(group) {
    setChatGroup(group);
  }


  function closeChat() {
    setChatGroup(null);
  }


  /* =========================
     CHAT SCREEN
  ========================= */

  if (chatGroup) {
    return (
      <GroupChat
        group={chatGroup}
        onClose={closeChat}
      />
    );
  }


  /* =========================
     PAGE
  ========================= */

  return (
    <main className="page">

      <div className="location-label">
        <span></span>
        GO TOGETHER · МАНГИСТАУ
      </div>


      <h1>
        Найди
        <br />
        <em>попутчиков</em>
      </h1>


      <p
        style={{
          color: "#91a5b5",
          lineHeight: "1.5",
          marginBottom: "20px",
        }}
      >
        Объединяйтесь в группы, чтобы
        разделить транспорт и расходы.
      </p>


      {/* =========================
          SMART TRIP
      ========================= */}

      {smartTrip && (
        <section className="group-smart-trip">

          <div className="group-smart-trip-top">

            <div>

              <div className="smart-trip-kicker">
                SMART TRIP
              </div>

              <h2>
                Подбираем попутчиков
              </h2>

            </div>


            <div className="group-smart-trip-icon">

              <Compass
                size={25}
                strokeWidth={2}
              />

            </div>

          </div>


          <div className="group-smart-trip-destination">

            <span>

              <MapPin
                size={20}
                strokeWidth={2}
              />

            </span>


            <div>

              <strong>
                {smartTrip.name}
              </strong>

              <small>
                {smartTrip.days || 1} дн. ·{" "}
                {smartTrip.people || 1} чел. ·{" "}
                {smartTrip.transport ===
                "bus"
                  ? "Автобус"
                  : smartTrip.transport ===
                    "tour"
                  ? "Туроператор"
                  : "Автомобиль"}
              </small>

            </div>

          </div>


          <p>
            Мы сначала показываем группы
            для выбранного направления.
          </p>


          <button
            className="group-clear-button"
            onClick={
              clearSmartTrip
            }
          >
            Показать все группы
          </button>

        </section>
      )}


      {/* =========================
          CREATE
      ========================= */}

      <button
        className="full-button primary"
        onClick={() =>
          setShowCreate(
            !showCreate
          )
        }
      >

        <UserPlus
          size={18}
          strokeWidth={2}
        />

        Создать группу

      </button>


      {/* MESSAGE */}

      {message && (
        <div
          className="warning-card"
          style={{
            marginTop: "15px",
          }}
        >
          {message}
        </div>
      )}


      {/* =========================
          CREATE FORM
      ========================= */}

      {showCreate && (
        <section
          className="safety-card"
          style={{
            marginTop: "20px",
          }}
        >

          <small>
            НОВАЯ ГРУППА
          </small>

          <h2>
            Куда едем?
          </h2>


          <input
            className="trip-select"
            placeholder="Название группы"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
          />


          <select
            className="trip-select"
            value={destination}
            onChange={(e) =>
              setDestination(
                e.target.value
              )
            }
          >

            <option value="">
              Выберите направление
            </option>

            <option value="Бозжыра">
              Бозжыра
            </option>

            <option value="Тамшалы">
              Тамшалы
            </option>

            <option value="Саура">
              Саура
            </option>

            <option value="Шеркела">
              Шеркала
            </option>

          </select>


          <input
            className="trip-select"
            type="date"
            value={date}
            onChange={(e) =>
              setDate(
                e.target.value
              )
            }
          />


          <select
            className="trip-select"
            value={maxMembers}
            onChange={(e) =>
              setMaxMembers(
                e.target.value
              )
            }
          >

            <option value="2">
              2 человека
            </option>

            <option value="3">
              3 человека
            </option>

            <option value="4">
              4 человека
            </option>

            <option value="5">
              5 человек
            </option>

            <option value="6">
              6 человек
            </option>

            <option value="8">
              8 человек
            </option>

            <option value="10">
              10 человек
            </option>

          </select>


          <button
            className="full-button primary"
            onClick={
              handleCreate
            }
          >
            Создать группу →
          </button>

        </section>
      )}


      {/* =========================
          GROUPS
      ========================= */}

      <div
        style={{
          marginTop: "25px",
          marginBottom: "100px",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
          }}
        >

          <small
            style={{
              color: "#61717d",
            }}
          >
            {smartTrip
              ? "ПОДХОДЯЩИЕ ГРУППЫ"
              : "ДОСТУПНЫЕ ГРУППЫ"}
          </small>


          {smartTrip && (
            <span
              style={{
                color: "#59c7d9",
                fontSize: "9px",
                fontWeight: "700",
                display: "flex",
                alignItems:
                  "center",
                gap: "4px",
              }}
            >

              <MapPin size={12} />

              {smartTrip.name}

            </span>
          )}

        </div>


        {/* LOADING */}

        {loading && (
          <section
            className="safety-card"
            style={{
              marginTop: "15px",
            }}
          >

            <h2>
              Загрузка...
            </h2>

            <p
              style={{
                color: "#91a5b5",
              }}
            >
              Ищем доступные группы.
            </p>

          </section>
        )}


        {/* EMPTY */}

        {!loading &&
          filteredGroups.length ===
            0 && (
            <section
              className="safety-card"
              style={{
                marginTop: "15px",
              }}
            >

              <div
                style={{
                  marginBottom:
                    "10px",
                  color: "#59c7d9",
                }}
              >

                <Users
                  size={34}
                  strokeWidth={1.8}
                />

              </div>


              <h2>
                Пока нет групп
              </h2>


              <p
                style={{
                  color: "#91a5b5",
                  lineHeight: "1.5",
                }}
              >
                Для этого направления
                пока никто не создал
                группу.
              </p>


              <button
                className="full-button primary"
                style={{
                  marginTop:
                    "15px",
                }}
                onClick={() =>
                  setShowCreate(
                    true
                  )
                }
              >
                Создать первую группу →
              </button>

            </section>
          )}


        {/* GROUP LIST */}

        {!loading &&
          filteredGroups.map(
            (group) => {

              const isMatching =
                smartTrip &&
                group.destination
                  ?.toLowerCase() ===
                  smartTrip.name
                    ?.toLowerCase();


              const isFull =
                Number(
                  group.members_count ||
                    0
                ) >=
                Number(
                  group.max_members
                );


              const members =
                Number(
                  group.members_count ||
                    0
                );


              const max =
                Number(
                  group.max_members
                );


              const percent =
                max > 0
                  ? Math.min(
                      100,
                      (members /
                        max) *
                        100
                    )
                  : 0;


              const freePlaces =
                Math.max(
                  0,
                  max - members
                );


              /*
                Сервер теперь возвращает
                is_member.

                Если пользователь уже
                вступил — показываем чат.
              */

              const isMember =
                group.is_member ===
                true;


              return (
                <section
                  key={group.id}
                  className="group-card"
                  style={{
                    marginTop:
                      "15px",
                  }}
                >

                  {isMatching && (
                    <div className="group-match">
                      Подходит для вашей поездки
                    </div>
                  )}


                  <div className="group-card-header">

                    <div>

                      <small>
                        GO TOGETHER
                      </small>

                      <h2>
                        {group.name}
                      </h2>

                    </div>


                    <div className="group-card-icon">

                      <Users
                        size={24}
                        strokeWidth={2}
                      />

                    </div>

                  </div>


                  <div className="group-info">

                    <div>

                      <span>
                        <MapPin
                          size={16}
                        />
                      </span>

                      <strong>
                        {group.destination}
                      </strong>

                    </div>


                    <div>

                      <span>
                        <CalendarDays
                          size={16}
                        />
                      </span>

                      <strong>
                        {group.trip_date
                          ? group.trip_date.slice(
                              0,
                              10
                            )
                          : "Дата не указана"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        <Users
                          size={16}
                        />
                      </span>

                      <strong>
                        {members} / {max} участников
                      </strong>

                    </div>

                  </div>


                  {/* SEATS */}

                  <div className="group-seats">

                    <div className="group-seats-bar">

                      <div
                        style={{
                          width:
                            `${percent}%`,
                        }}
                      />

                    </div>


                    <span>
                      {isFull
                        ? "Мест нет"
                        : `Свободно ${freePlaces} мест`}
                    </span>

                  </div>


                  {/* ACTION */}

                  {isMember ? (

                    <button
                      className="full-button primary group-chat-open-button"
                      style={{
                        marginTop:
                          "15px",
                      }}
                      onClick={() =>
                        openChat(
                          group
                        )
                      }
                    >

                      <MessageCircle
                        size={18}
                      />

                      Открыть чат

                    </button>

                  ) : (

                    <button
                      className={
                        isFull
                          ? "full-button dark"
                          : "full-button primary"
                      }
                      style={{
                        marginTop:
                          "15px",
                      }}
                      disabled={
                        isFull
                      }
                      onClick={() =>
                        handleJoin(
                          group.id
                        )
                      }
                    >

                      {isFull
                        ? "Группа заполнена"
                        : "Присоединиться →"}

                    </button>

                  )}

                </section>
              );
            }
          )}

      </div>

    </main>
  );
}


export default Groups;