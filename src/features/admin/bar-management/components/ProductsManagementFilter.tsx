import { useBarContext } from "@/features/bar";
import { FaSearch } from "react-icons/fa";

const ProductsManagementFilter = () => {
  /* - Puxando do context - */

  const {
    productsCategories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  } = useBarContext();

  return (
    <div className="flex flex-col gap-4 w-full md:flex-row md:items-center md:justify-between md:gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
      {/* - Searchbar - */}

      <div className="flex items-center bg-[#0A0A0A] border border-[#B8860B] w-full md:w-[35%] h-12 rounded-lg text-xs sm:text-sm text-white/60 outline-none p-2 shrink-0">
        <FaSearch className="my-auto mx-2 text-white/60 pointer-events-none" />

        <input
          className="bg-transparent text-white font-semibold text-sm outline-none focus:outline-none w-full"
          placeholder="Buscar Produto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* - Filtro - */}

      <div className="flex flex-wrap items-center justify-start md:justify-end gap-2.5 md:flex-1 md:flex-nowrap lg:flex-1 lg:flex-nowrap">
        {productsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              className={`flex items-center justify-center shrink-0 h-12 px-3 sm:px-4 py-2 border rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${
                selectedCategory === category.id
                  ? "bg-[#B8860B] hover:bg-[#DDAE56] text-black border-black"
                  : "bg-[black] hover:bg-[#333] text-white border-[#B8860B]"
              }`}
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
            >
              <Icon className="h-5 w-5 mr-2" />

              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { ProductsManagementFilter };
