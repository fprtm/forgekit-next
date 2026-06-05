export default function Wrapper({children}: {children: React.ReactNode}) {
    return (
        <div className="flex flex-col gap-8 w-full select-none max-w-full md:max-w-7xl  mx-auto">
            {children}
        </div>
    )
}