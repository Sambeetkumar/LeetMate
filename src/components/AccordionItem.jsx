const AccordionItem = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
      <button
        className="w-full px-4 py-3 text-left bg-gray-100 hover:bg-gray-200 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-200"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900">{title}</span>
        <span 
          className={`text-gray-500 transition-transform duration-200 inline-block ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ fontSize: '14px' }}
        >
          ▼
        </span>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{
          overflow: 'hidden'
        }}
      >
        <div className="px-4 py-3 bg-white text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;