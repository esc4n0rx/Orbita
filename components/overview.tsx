"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Seg",
    tarefas: 5,
    concluidas: 4,
  },
  {
    name: "Ter",
    tarefas: 7,
    concluidas: 6,
  },
  {
    name: "Qua",
    tarefas: 6,
    concluidas: 4,
  },
  {
    name: "Qui",
    tarefas: 8,
    concluidas: 5,
  },
  {
    name: "Sex",
    tarefas: 9,
    concluidas: 7,
  },
  {
    name: "Sáb",
    tarefas: 4,
    concluidas: 3,
  },
  {
    name: "Dom",
    tarefas: 3,
    concluidas: 2,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-800" vertical={false} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-2 shadow-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-slate-400">Tarefas</span>
                      <span className="font-bold text-cyan-500">{payload[0].value}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-slate-400">Concluídas</span>
                      <span className="font-bold text-yellow-500">{payload[1].value}</span>
                    </div>
                  </div>
                </div>
              )
            }

            return null
          }}
        />
        <Bar dataKey="tarefas" fill="#38BDF8" radius={[4, 4, 0, 0]} className="fill-cyan-500" />
        <Bar dataKey="concluidas" fill="#FACC15" radius={[4, 4, 0, 0]} className="fill-yellow-500" />
      </BarChart>
    </ResponsiveContainer>
  )
}
