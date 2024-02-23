import React from "react";

type Props = {};

const BGCheck = (props: Props) => {
  return (
    <div className="">
      <div className="h-[100vh] w-[100vw] bg-cover bg-no-repeat bg-center top-0 z-1">
        <div className="bg-black-text before:bg-gradient-url h-[100vh] w-[100vw] bg-cover bg-no-repeat bg-center before:mix-blend-hard-light relative before:absolute before:w-[100vw] before:h-[100vh]">
          <div className="text-black-text font-bold text-6xl z-2 absolute">
            <h1>Background with Blend Modes</h1>
            <p>Text on top with no blend</p>
          </div>
        </div>
      </div>
      {/* <div className="text-black-text font-bold text-6xl z-2 bg-white">
        <h1>Background with Blend Modes</h1>
        <p>Text on top with no blend</p>
      </div> */}
    </div>
  );
};

export default BGCheck;
