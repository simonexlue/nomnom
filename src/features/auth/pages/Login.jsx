export default function Login() {
  return (
    <div className="p-6 w-full h-screen flex justify-center items-center">
      <div className="rounded-xl w-3/4 h-3/4 flex flex-col justify-center items-center">
        <h1 className="flex justify-center text-2xl font-semibold py-4">
          LOGIN
        </h1>
        <input
          className="bg-gray-200 rounded-xl py-2 px-4 w-1/2 my-2 focus:outline-yellow-300"
          type="text"
          placeholder="Username"
        ></input>
        <input
          className="bg-gray-200 rounded-xl py-2 px-4 w-1/2 my-2 focus:outline-yellow-300"
          type="text"
          placeholder="Password"
        ></input>
        <button className="my-2 bg-yellow-400 py-2 px-4 rounded-xl">
          Login
        </button>
      </div>
    </div>
  );
}
