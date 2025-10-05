function Header({ onToggleSidebar }) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-black/10 dark:border-white/10">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-black/90 dark:text-white/90">Tela Inicial</h1>
      </div>

      <div className="flex-1 flex justify-end items-center gap-4">
        <button className="relative rounded-full p-2 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5">
          <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
            <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
          </svg>
        </button>

        <div 
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBYvoVoC-iyF3cZaKM3vM8a8dn-bOVB0-Q3vYxLJFfwyM3U5QaJ-IbYD2gCQdjnOk_kro1SZoDL2NMMbpfy6qlRG1elHAsRmJ5QgH33G5FlepoCEln87b9hvZ-JDOIECD-_jIdITQcYT5XxPnDyQ1jhpuu4Fnw-yHELLtn5z3YKBVnhPy7qos04ZpMbbuNwLn4jk1vItSFv6wl9J5U0_giCWf8Yq1wSAwUindkteOY29rIG0Y4YyNB-at-r_Zub9-2z67_dUH3QwWWR")'}}
        ></div>
      </div>
    </header>
  );
}

export default Header;