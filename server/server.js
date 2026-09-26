const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const {
  registerUser,
  loginUser,
  authenticateToken,
  requireAdmin,
} = require("./auth/auth");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* =========================
   DATABASE
========================= */

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT || 5432),
    });

pool.on("error", (error) => {
  console.error("PostgreSQL error:", error);
});

/* =========================
   BASIC
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MANGYSTAU GO API работает",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS time"
    );

    res.json({
      success: true,
      status: "ok",
      database: "connected",
      time: result.rows[0].time,
    });
  } catch (error) {
    console.error("HEALTH ERROR:", error);

    res.status(500).json({
      success: false,
      status: "error",
      database: "disconnected",
      message: error.message,
    });
  }
});

/* =========================
   AUTH
========================= */

/*
  REGISTER

  POST /api/auth/register
*/

app.post(
  "/api/auth/register",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        phone,
      } = req.body;

      const result = await registerUser(pool, {
        name,
        email,
        password,
        phone,
      });

      res.status(201).json({
        success: true,
        message:
          "Регистрация успешно выполнена",
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      res.status(400).json({
        success: false,
        message:
          error.message ||
          "Ошибка регистрации",
      });
    }
  }
);

/*
  LOGIN

  POST /api/auth/login
*/

app.post(
  "/api/auth/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      const result = await loginUser(pool, {
        email,
        password,
      });

      res.json({
        success: true,
        message: "Вход выполнен успешно",
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      res.status(401).json({
        success: false,
        message:
          error.message ||
          "Ошибка входа",
      });
    }
  }
);

/*
  CURRENT USER

  GET /api/auth/me
*/

app.get(
  "/api/auth/me",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          name,
          email,
          phone,
          role,
          created_at
        FROM users
        WHERE id = $1
        `,
        [req.user.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Пользователь не найден",
        });
      }

      res.json({
        success: true,
        user: result.rows[0],
      });
    } catch (error) {
      console.error(
        "AUTH ME ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Ошибка получения пользователя",
      });
    }
  }
);

/* =========================
   PLACES
========================= */

/*
  Все туристические места.
*/

app.get(
  "/api/places",
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          id,
          name,
          category,
          distance,
          description,
          emoji,
          safety_info,
          latitude,
          longitude,

          access_status,
          status_reason,
          status_source,
          status_source_url,
          status_updated_at

        FROM places
        ORDER BY id
      `);

      res.json({
        success: true,
        count: result.rows.length,
        places: result.rows,
      });
    } catch (error) {
      console.error(
        "GET PLACES ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось получить места",
      });
    }
  }
);

/*
  Одно туристическое место.
*/

app.get(
  "/api/places/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT
          id,
          name,
          category,
          distance,
          description,
          emoji,
          safety_info,
          latitude,
          longitude,

          access_status,
          status_reason,
          status_source,
          status_source_url,
          status_updated_at

        FROM places
        WHERE id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Место не найдено",
        });
      }

      res.json({
        success: true,
        place: result.rows[0],
      });
    } catch (error) {
      console.error(
        "GET PLACE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Ошибка сервера",
      });
    }
  }
);

/* =========================
   ADMIN — PLACES
========================= */

/*
  Получить все места для админки.
*/

app.get(
  "/api/admin/places",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          id,
          name,
          category,
          distance,
          description,
          emoji,
          safety_info,
          latitude,
          longitude,

          access_status,
          status_reason,
          status_source,
          status_source_url,
          status_updated_at

        FROM places
        ORDER BY id
      `);

      res.json({
        success: true,
        places: result.rows,
      });
    } catch (error) {
      console.error(
        "ADMIN GET PLACES ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось получить места",
      });
    }
  }
);

/*
  Добавить новое место.
*/

app.post(
  "/api/admin/places",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        name,
        category,
        distance,
        description,
        emoji,
        safety_info,
        latitude,
        longitude,
        access_status,
        status_reason,
        status_source,
        status_source_url,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Название места обязательно",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO places
        (
          name,
          category,
          distance,
          description,
          emoji,
          safety_info,
          latitude,
          longitude,

          access_status,
          status_reason,
          status_source,
          status_source_url,
          status_updated_at
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          NOW()
        )
        RETURNING *
        `,
        [
          name.trim(),
          category || null,
          distance || null,
          description || null,
          emoji || "📍",
          safety_info || null,

          latitude === ""
            ? null
            : latitude || null,

          longitude === ""
            ? null
            : longitude || null,

          access_status || "open",
          status_reason || null,
          status_source || null,
          status_source_url || null,
        ]
      );

      res.status(201).json({
        success: true,
        message:
          "Место успешно добавлено",
        place: result.rows[0],
      });
    } catch (error) {
      console.error(
        "ADMIN CREATE PLACE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось добавить место",
      });
    }
  }
);

/*
  Изменить существующее место.
*/

app.put(
  "/api/admin/places/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        name,
        category,
        distance,
        description,
        emoji,
        safety_info,
        latitude,
        longitude,
        access_status,
        status_reason,
        status_source,
        status_source_url,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Название места обязательно",
        });
      }

      const result = await pool.query(
        `
        UPDATE places
        SET
          name = $1,
          category = $2,
          distance = $3,
          description = $4,
          emoji = $5,
          safety_info = $6,
          latitude = $7,
          longitude = $8,

          access_status = $9,
          status_reason = $10,
          status_source = $11,
          status_source_url = $12,
          status_updated_at = NOW()

        WHERE id = $13

        RETURNING *
        `,
        [
          name.trim(),
          category || null,
          distance || null,
          description || null,
          emoji || "📍",
          safety_info || null,

          latitude === ""
            ? null
            : latitude || null,

          longitude === ""
            ? null
            : longitude || null,

          access_status || "open",
          status_reason || null,
          status_source || null,
          status_source_url || null,

          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Место не найдено",
        });
      }

      res.json({
        success: true,
        message:
          "Место успешно обновлено",
        place: result.rows[0],
      });
    } catch (error) {
      console.error(
        "ADMIN UPDATE PLACE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось обновить место",
      });
    }
  }
);

/* =========================
   TRIPS
========================= */

/*
  Создание поездки.
*/

app.post(
  "/api/trips",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        place_id,
        days,
        transport,
        people,
        budget,
      } = req.body;

      const userId =
        req.user.userId;

      const result = await pool.query(
        `
        INSERT INTO trips
        (
          user_id,
          place_id,
          days,
          transport,
          people,
          budget
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        RETURNING *
        `,
        [
          userId,
          place_id || null,
          days || null,
          transport || null,
          people || null,
          budget || null,
        ]
      );

      res.status(201).json({
        success: true,
        message:
          "Поездка сохранена",
        trip: result.rows[0],
      });
    } catch (error) {
      console.error(
        "CREATE TRIP ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось создать поездку",
      });
    }
  }
);

/*
  Все поездки.
*/

app.get(
  "/api/trips",
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          trips.id,
          trips.user_id,
          trips.days,
          trips.transport,
          trips.people,
          trips.budget,
          trips.status,
          trips.created_at,
          places.name AS place_name
        FROM trips
        LEFT JOIN places
          ON trips.place_id = places.id
        ORDER BY trips.created_at DESC
      `);

      res.json({
        success: true,
        count: result.rows.length,
        trips: result.rows,
      });
    } catch (error) {
      console.error(
        "GET TRIPS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось получить поездки",
      });
    }
  }
);

/*
  Мои поездки.
*/

app.get(
  "/api/profile/trips",
  authenticateToken,
  async (req, res) => {
    try {
      const userId =
        req.user.userId;

      const result = await pool.query(
        `
        SELECT
          trips.id,
          trips.days,
          trips.transport,
          trips.people,
          trips.budget,
          trips.status,
          trips.created_at,
          places.name AS place_name
        FROM trips
        LEFT JOIN places
          ON trips.place_id = places.id
        WHERE trips.user_id = $1
        ORDER BY trips.created_at DESC
        `,
        [userId]
      );

      res.json({
        success: true,
        count: result.rows.length,
        trips: result.rows,
      });
    } catch (error) {
      console.error(
        "MY TRIPS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось получить мои поездки",
      });
    }
  }
);

/* =========================
   SAFETY ALERTS
========================= */

app.get(
  "/api/safety",
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          safety_alerts.id,
          safety_alerts.level,
          safety_alerts.title,
          safety_alerts.message,
          safety_alerts.source,
          safety_alerts.is_active,
          safety_alerts.created_at,
          places.name AS place_name

        FROM safety_alerts

        LEFT JOIN places
          ON safety_alerts.place_id =
             places.id

        WHERE safety_alerts.is_active =
              TRUE

        ORDER BY
          safety_alerts.created_at DESC
      `);

      res.json({
        success: true,
        count: result.rows.length,
        alerts: result.rows,
      });
    } catch (error) {
      console.error(
        "SAFETY ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось получить предупреждения",
      });
    }
  }
);

/* =========================
   WEATHER
========================= */

app.get(
  "/api/weather",
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          weather_data.id,
          weather_data.wind_speed,
          weather_data.wind_gust,
          weather_data.wave_condition,
          weather_data.temperature,
          weather_data.source,
          weather_data.recorded_at,
          places.name AS place_name

        FROM weather_data

        LEFT JOIN places
          ON weather_data.place_id =
             places.id

        ORDER BY
          weather_data.recorded_at DESC
      `);

      res.json({
        success: true,
        count: result.rows.length,
        weather: result.rows,
      });
    } catch (error) {
      console.error(
        "WEATHER ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось получить данные погоды",
      });
    }
  }
);

/* =========================
   WEATHER BY PLACE
========================= */

app.get(
  "/api/weather/place/:placeId",
  async (req, res) => {
    try {
      const {
        placeId,
      } = req.params;

      const result = await pool.query(
        `
        SELECT
          weather_by_place.id,
          weather_by_place.place_id,

          places.name AS place_name,
          places.category,
          places.latitude,
          places.longitude,

          weather_by_place.temperature,
          weather_by_place.feels_like,

          weather_by_place.wind_speed,
          weather_by_place.wind_gust,
          weather_by_place.wind_direction,

          weather_by_place.precipitation,
          weather_by_place.weather_condition,

          weather_by_place.wave_condition,

          weather_by_place.risk_level,

          weather_by_place.source,
          weather_by_place.source_url,

          weather_by_place.recorded_at

        FROM weather_by_place

        INNER JOIN places
          ON places.id =
             weather_by_place.place_id

        WHERE weather_by_place.place_id =
              $1

        ORDER BY
          weather_by_place.recorded_at DESC

        LIMIT 1
        `,
        [placeId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Данные погоды для этого места не найдены",
        });
      }

      res.json({
        success: true,
        weather: result.rows[0],
      });
    } catch (error) {
      console.error(
        "WEATHER BY PLACE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось получить погоду для места",
      });
    }
  }
);
/* =========================
   GROUPS
========================= */

/*
  Получить все группы.
*/

app.get(
  "/api/groups",
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          groups.id,
          groups.name,
          groups.description,
          groups.destination,
          groups.trip_date,
          groups.max_members,
          groups.created_at,

          users.name AS creator_name,

          COUNT(
            group_members.user_id
          )::INTEGER AS members_count

        FROM groups

        LEFT JOIN users
          ON users.id =
             groups.creator_id

        LEFT JOIN group_members
          ON group_members.group_id =
             groups.id

        GROUP BY
          groups.id,
          users.name

        ORDER BY
          groups.created_at DESC
      `);

      res.json({
        success: true,
        groups: result.rows,
      });
    } catch (error) {
      console.error(
        "GET GROUPS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось получить группы",
      });
    }
  }
);

/*
  Создать группу.
*/

app.post(
  "/api/groups",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        name,
        description,
        destination,
        trip_date,
        max_members,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Название группы обязательно",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO groups
        (
          name,
          description,
          destination,
          trip_date,
          max_members,
          creator_id
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        RETURNING *
        `,
        [
          name.trim(),
          description || null,
          destination || null,
          trip_date || null,
          max_members || 10,
          req.user.userId,
        ]
      );

      const group =
        result.rows[0];

      /*
        Создатель автоматически
        становится участником.
      */

      await pool.query(
        `
        INSERT INTO group_members
        (
          group_id,
          user_id
        )
        VALUES
        (
          $1,
          $2
        )
        ON CONFLICT DO NOTHING
        `,
        [
          group.id,
          req.user.userId,
        ]
      );

      res.status(201).json({
        success: true,
        message:
          "Группа создана",
        group,
      });
    } catch (error) {
      console.error(
        "CREATE GROUP ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось создать группу",
      });
    }
  }
);

/*
  Вступить в группу.
*/

app.post(
  "/api/groups/:id/join",
  authenticateToken,
  async (req, res) => {
    const client =
      await pool.connect();

    try {
      await client.query(
        "BEGIN"
      );

      const {
        id: groupId,
      } = req.params;

      const groupResult =
        await client.query(
          `
          SELECT
            id,
            max_members
          FROM groups
          WHERE id = $1
          FOR UPDATE
          `,
          [groupId]
        );

      if (
        groupResult.rows.length === 0
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(404).json({
          success: false,
          message:
            "Группа не найдена",
        });
      }

      const group =
        groupResult.rows[0];

      const countResult =
        await client.query(
          `
          SELECT COUNT(*)::INTEGER AS count
          FROM group_members
          WHERE group_id = $1
          `,
          [groupId]
        );

      const membersCount =
        countResult.rows[0].count;

      if (
        membersCount >=
        Number(group.max_members)
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(400).json({
          success: false,
          message:
            "В группе нет свободных мест",
        });
      }

      const existing =
        await client.query(
          `
          SELECT id
          FROM group_members
          WHERE group_id = $1
            AND user_id = $2
          `,
          [
            groupId,
            req.user.userId,
          ]
        );

      if (
        existing.rows.length > 0
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(400).json({
          success: false,
          message:
            "Вы уже состоите в этой группе",
        });
      }

      await client.query(
        `
        INSERT INTO group_members
        (
          group_id,
          user_id
        )
        VALUES
        (
          $1,
          $2
        )
        `,
        [
          groupId,
          req.user.userId,
        ]
      );

      await client.query(
        "COMMIT"
      );

      res.json({
        success: true,
        message:
          "Вы вступили в группу",
      });
    } catch (error) {
      await client.query(
        "ROLLBACK"
      );

      console.error(
        "JOIN GROUP ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось вступить в группу",
      });
    } finally {
      client.release();
    }
  }
);

/*
  Мои группы.
*/

app.get(
  "/api/profile/groups",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          groups.id,
          groups.name,
          groups.description,
          groups.destination,
          groups.trip_date,
          groups.max_members,
          groups.created_at,

          COUNT(
            gm2.user_id
          )::INTEGER AS members_count

        FROM group_members gm

        INNER JOIN groups
          ON groups.id =
             gm.group_id

        LEFT JOIN group_members gm2
          ON gm2.group_id =
             groups.id

        WHERE gm.user_id = $1

        GROUP BY
          groups.id

        ORDER BY
          groups.created_at DESC
        `,
        [req.user.userId]
      );

      res.json({
        success: true,
        groups: result.rows,
      });
    } catch (error) {
      console.error(
        "MY GROUPS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось получить мои группы",
      });
    }
  }
);

/* =========================
   GROUP CHAT
========================= */

/*
  Получить сообщения группы.
*/

app.get(
  "/api/groups/:id/messages",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      /*
        Проверяем, состоит ли пользователь
        в группе.
      */

      const memberResult = await pool.query(
        `
        SELECT id
        FROM group_members
        WHERE group_id = $1
          AND user_id = $2
        `,
        [id, userId]
      );

      if (memberResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message:
            "Сначала вступите в группу",
        });
      }

      const result = await pool.query(
        `
        SELECT
          group_messages.id,
          group_messages.group_id,
          group_messages.user_id,
          group_messages.message,
          group_messages.created_at,

          users.name AS user_name

        FROM group_messages

        INNER JOIN users
          ON users.id =
             group_messages.user_id

        WHERE group_messages.group_id = $1

        ORDER BY
          group_messages.created_at ASC
        `,
        [id]
      );

      res.json({
        success: true,
        messages: result.rows,
      });
    } catch (error) {
      console.error(
        "GET GROUP MESSAGES ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось загрузить сообщения",
      });
    }
  }
);


/*
  Отправить сообщение в группу.
*/

app.post(
  "/api/groups/:id/messages",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const {
        message,
      } = req.body;

      if (
        !message ||
        !message.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Сообщение не может быть пустым",
        });
      }

      /*
        Проверяем участника.
      */

      const memberResult = await pool.query(
        `
        SELECT id
        FROM group_members
        WHERE group_id = $1
          AND user_id = $2
        `,
        [id, userId]
      );

      if (memberResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message:
            "Только участники группы могут писать в чат",
        });
      }

      /*
        Проверяем существование группы.
      */

      const groupResult = await pool.query(
        `
        SELECT id
        FROM groups
        WHERE id = $1
        `,
        [id]
      );

      if (groupResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Группа не найдена",
        });
      }

      /*
        Сохраняем сообщение.
      */

      const result = await pool.query(
        `
        INSERT INTO group_messages
        (
          group_id,
          user_id,
          message
        )
        VALUES
        (
          $1,
          $2,
          $3
        )
        RETURNING
          id,
          group_id,
          user_id,
          message,
          created_at
        `,
        [
          id,
          userId,
          message.trim(),
        ]
      );

      /*
        Получаем имя пользователя.
      */

      const userResult = await pool.query(
        `
        SELECT name
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

      res.status(201).json({
        success: true,

        message: {
          ...result.rows[0],

          user_name:
            userResult.rows[0]?.name ||
            "Пользователь",
        },
      });
    } catch (error) {
      console.error(
        "SEND GROUP MESSAGE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось отправить сообщение",
      });
    }
  }
);

/* =========================
   PROFILE
========================= */

app.get(
  "/api/profile/stats",
  authenticateToken,
  async (req, res) => {
    try {
      const userId =
        req.user.userId;

      const tripsResult =
        await pool.query(
          `
          SELECT COUNT(*)::INTEGER AS count
          FROM trips
          WHERE user_id = $1
          `,
          [userId]
        );

      const groupsResult =
        await pool.query(
          `
          SELECT COUNT(*)::INTEGER AS count
          FROM group_members
          WHERE user_id = $1
          `,
          [userId]
        );

      const favoritesResult =
        await pool.query(
          `
          SELECT COUNT(*)::INTEGER AS count
          FROM favorites
          WHERE user_id = $1
          `,
          [userId]
        );

      res.json({
        success: true,

        stats: {
          trips:
            tripsResult.rows[0].count,

          groups:
            groupsResult.rows[0].count,

          favorites:
            favoritesResult.rows[0].count,
        },
      });
    } catch (error) {
      console.error(
        "PROFILE STATS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось получить статистику профиля",
      });
    }
  }
);

/* =========================
   ADMIN DASHBOARD
========================= */

app.get(
  "/api/admin/dashboard",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const usersResult =
        await pool.query(
          `
          SELECT COUNT(*)::INTEGER AS count
          FROM users
          `
        );

      const placesResult =
        await pool.query(
          `
          SELECT COUNT(*)::INTEGER AS count
          FROM places
          `
        );

      const tripsResult =
        await pool.query(
          `
          SELECT COUNT(*)::INTEGER AS count
          FROM trips
          `
        );

      const groupsResult =
        await pool.query(
          `
          SELECT COUNT(*)::INTEGER AS count
          FROM groups
          `
        );

      const alertsResult =
        await pool.query(
          `
          SELECT COUNT(*)::INTEGER AS count
          FROM safety_alerts
          WHERE is_active = TRUE
          `
        );

      const activeUsersResult =
        await pool.query(
          `
          SELECT COUNT(*)::INTEGER AS count
          FROM users
          `
        );

      const popularPlacesResult =
        await pool.query(
          `
          SELECT
            places.id,
            places.name,
            COUNT(trips.id)::INTEGER AS trips_count

          FROM places

          LEFT JOIN trips
            ON trips.place_id =
               places.id

          GROUP BY
            places.id,
            places.name

          ORDER BY
            trips_count DESC,
            places.name ASC

          LIMIT 10
          `
        );

      const recentTripsResult =
        await pool.query(
          `
          SELECT
            trips.id,
            trips.created_at,
            trips.days,
            trips.transport,
            trips.people,
            trips.budget,

            users.name AS user_name,

            places.name AS place_name

          FROM trips

          LEFT JOIN users
            ON users.id =
               trips.user_id

          LEFT JOIN places
            ON places.id =
               trips.place_id

          ORDER BY
            trips.created_at DESC

          LIMIT 10
          `
        );

      res.json({
        success: true,

        stats: {
          users:
            usersResult.rows[0].count,

          places:
            placesResult.rows[0].count,

          trips:
            tripsResult.rows[0].count,

          groups:
            groupsResult.rows[0].count,

          active_alerts:
            alertsResult.rows[0].count,

          active_users:
            activeUsersResult.rows[0].count,
        },

        popular_places:
          popularPlacesResult.rows,

        recent_trips:
          recentTripsResult.rows,
      });
    } catch (error) {
      console.error(
        "ADMIN DASHBOARD ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось загрузить административную панель",
      });
    }
  }
);

/* =========================
   ADMIN — SAFETY
========================= */

/*
  Получить все предупреждения.
*/

app.get(
  "/api/admin/safety",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result =
        await pool.query(`
          SELECT
            safety_alerts.id,
            safety_alerts.level,
            safety_alerts.title,
            safety_alerts.message,
            safety_alerts.source,
            safety_alerts.is_active,
            safety_alerts.created_at,

            safety_alerts.place_id,

            places.name AS place_name

          FROM safety_alerts

          LEFT JOIN places
            ON places.id =
               safety_alerts.place_id

          ORDER BY
            safety_alerts.created_at DESC
        `);

      res.json({
        success: true,
        alerts: result.rows,
      });
    } catch (error) {
      console.error(
        "ADMIN SAFETY GET ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось загрузить предупреждения",
      });
    }
  }
);

/*
  Создать предупреждение.
*/

app.post(
  "/api/admin/safety",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        level,
        title,
        message,
        source,
        place_id,
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Заголовок предупреждения обязателен",
        });
      }

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Текст предупреждения обязателен",
        });
      }

      const result =
        await pool.query(
          `
          INSERT INTO safety_alerts
          (
            level,
            title,
            message,
            source,
            place_id,
            is_active
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            TRUE
          )
          RETURNING *
          `,
          [
            level || "yellow",
            title.trim(),
            message.trim(),
            source || null,
            place_id || null,
          ]
        );

      res.status(201).json({
        success: true,
        message:
          "Предупреждение создано",
        alert: result.rows[0],
      });
    } catch (error) {
      console.error(
        "ADMIN SAFETY CREATE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось создать предупреждение",
      });
    }
  }
);

/*
  Включить / выключить предупреждение.
*/

app.patch(
  "/api/admin/safety/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      const {
        is_active,
        level,
        title,
        message,
        source,
        place_id,
      } = req.body;

      const result =
        await pool.query(
          `
          UPDATE safety_alerts

          SET
            is_active =
              COALESCE(
                $1,
                is_active
              ),

            level =
              COALESCE(
                $2,
                level
              ),

            title =
              COALESCE(
                $3,
                title
              ),

            message =
              COALESCE(
                $4,
                message
              ),

            source =
              COALESCE(
                $5,
                source
              ),

            place_id =
              COALESCE(
                $6,
                place_id
              )

          WHERE id = $7

          RETURNING *
          `,
          [
            typeof is_active ===
            "boolean"
              ? is_active
              : null,

            level || null,
            title || null,
            message || null,
            source || null,
            place_id || null,

            id,
          ]
        );

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Предупреждение не найдено",
        });
      }

      res.json({
        success: true,
        message:
          "Предупреждение обновлено",
        alert: result.rows[0],
      });
    } catch (error) {
      console.error(
        "ADMIN SAFETY UPDATE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось обновить предупреждение",
      });
    }
  }
);

/* =========================
   ADMIN — GROUPS
========================= */

app.get(
  "/api/admin/groups",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result =
        await pool.query(`
          SELECT
            groups.id,
            groups.name,
            groups.description,
            groups.destination,
            groups.trip_date,
            groups.max_members,
            groups.created_at,

            users.name AS creator_name,

            COUNT(
              group_members.user_id
            )::INTEGER AS members_count

          FROM groups

          LEFT JOIN users
            ON users.id =
               groups.creator_id

          LEFT JOIN group_members
            ON group_members.group_id =
               groups.id

          GROUP BY
            groups.id,
            users.name

          ORDER BY
            groups.created_at DESC
        `);

      res.json({
        success: true,
        groups: result.rows,
      });
    } catch (error) {
      console.error(
        "ADMIN GROUPS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось загрузить группы",
      });
    }
  }
);

/* =========================
   ADMIN — USERS
========================= */

app.get(
  "/api/admin/users",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result =
        await pool.query(`
          SELECT
            id,
            name,
            email,
            phone,
            role,
            created_at

          FROM users

          ORDER BY
            created_at DESC
        `);

      res.json({
        success: true,
        users: result.rows,
      });
    } catch (error) {
      console.error(
        "ADMIN USERS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Не удалось загрузить пользователей",
      });
    }
  }
);

/* =========================
   START SERVER
========================= */

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `MANGYSTAU GO API запущен на порту ${PORT}`
    );
  });
}

module.exports = app;