import { MouseEventHandler, ReactNode } from "react";

export default function GamemodeButton(inputProps: {
    children: React.ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>
}) {
    const props = {...inputProps}
  return (
    <div className="flex flex-col gap-[3rem]">
      <button
        className="border-solid border-2 border-white text-white 
                font-bold py-4 px-[13rem] rounded-full transition-all duration-200 transform hover:scale-105 
                shadow-lg text-xl font-gotham text-center"
      >
        {props.children}
      </button>
    </div>
  );
}
