import sqlite from "sqlite3";

const db = new sqlite.Database('chat.db', sqlite.OPEN_READWRITE, (err) => {
    createDatabase()
})

const createDatabase = () => {
    const newdb = new sqlite.Database('chat.db', (err) => {
        if (err) {
            console.log("Error: " + err);
            process.exit(1);
        }
    });
}


db.run(`
        CREATE TABLE IF NOT EXISTS chat (
            sender TEXT NOT NULL,
            receiver TEXT NOT NULL,
            content TEXT NOT NULL,
            time DATETIME DEFAULT (strftime('%s', 'now', 'utc'))
        );`
)

db.run(`
        CREATE TABLE IF NOT EXISTS stat (
            food number NOT NULL,
            happy number NOT NULL,
            sender text NOT NULL
        );`
)

export const readSpecificSenderStat = (sender) => {
    const sql = `select * from chat where (sender="${sender}")`
    let res = null
    db.all(sql, [], (err, row) => {
        if (err) {
            console.log(sql);
            console.log(err);
            return
        }

        row.forEach((ele) => {
            console.log(ele);
            res = ele
        })
    })
    return res
}

// Function to update or create an entry in the 'stat' table
export function updateOrCreateStatEntry(food, happy, sender) {
    db.run(
        'INSERT OR REPLACE INTO stat (food, happy, sender) VALUES (?, ?, ?)',
        [food, happy, sender],
        function (err) {
            if (err) {
                console.error('Error updating or creating entry:', err.message);
            } else {
                console.log(`Entry updated or created with ID ${this.lastID}`);
            }
        }
    );
}


export const writeToChatDB = (sender, receiver, content) => {
    db.run(`insert into chat (sender,receiver,content) values ("${sender}","${receiver}","${content}")`)
}

export const readFormChatDB = (sender, receiver) => {
    const sql = `select * from chat where (sender="${sender}" AND receiver="${receiver}") order by time asc`
    const res = []
    db.all(sql, [], (err, row) => {
        if (err) {
            console.log(sql);
            console.log(err);
            return
        }

        row.forEach((ele) => {
            // console.log(ele);
            res.push(ele)
        })
    })

    return res
}

