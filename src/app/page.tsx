"use client";

import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

export default function Chat() {
  const [value, setValue] = useState("");
  const [text, setText] = useState("");

  return (
    <main className="flex justify-center items-center min-h-screen max-md:w-screen">
      <div className="p-8 flex flex-col bg-white w-[600px] h-[800px] items-center justify-center gap-4 rounded-md shadow-sm max-md:w-screen max-md:h-screen max-md:p-4">
        <section className="grow w-full overflow-auto">
          <ReactMarkdown>{text}</ReactMarkdown>
        </section>
        <form className="flex gap-3 w-full">
          <input
            className="rounded-md p-3 text-black grow border border-neutral-300 outline-none"
            value={value}
            onChange={(e) => {
              setValue(e.currentTarget.value);
            }}
            placeholder="Pergunte sobre a APIJS..."
          />
          <button
            className="p-3 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-all"
            type="submit"
            onClick={(e) => {
              e.preventDefault();

              axios({
                method: "post",
                url: "/api/chat",
                data: {
                  value,
                },
              }).then((res) => {
                setText(res.data);
              });
            }}
          >
            Perguntar
          </button>
        </form>
      </div>
    </main>
  );
}
