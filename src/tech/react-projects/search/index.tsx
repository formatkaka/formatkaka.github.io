import { Input } from '@/react/input';
import { useMovieSearch } from './useMovieSearch';
import { useEffect, useState } from 'react';
import { useClickAway } from '@uidotdev/usehooks';


export const Search = () => {
  const { search, setSearch, data } = useMovieSearch();
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');

  const containerRef = useClickAway<HTMLDivElement>(() => {
    setOpen(false);
    setSelectedIndex(-1);
  }) 

  const onSearchInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.currentTarget.value;
    setSearch(value);
    setInputValue(value);
    setSelectedIndex(-1);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !data?.results.length) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();

      if(selectedIndex === data.results.length -1 ){
        setSelectedIndex(-1);
        setInputValue(search);
        return;
      }

      const newIndex = selectedIndex < data.results.length - 1 ? selectedIndex + 1 : 0;
      setSelectedIndex(newIndex);
      setInputValue(data.results[newIndex].title);
      return;
    } 
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();

      if(selectedIndex === 0 ){
        setSelectedIndex(-1);
        setInputValue(search);
        return;
      }

      const newIndex = selectedIndex > 0 ? selectedIndex - 1 : data.results.length - 1;
      setSelectedIndex(newIndex);
      setInputValue(data.results[newIndex].title);
      return;
    } 
    
    console.log("🚀 ~ handleKeyDown ~ e.key:", e.key)
    if (e.key === 'Escape') {
      setOpen(false)
      setSelectedIndex(-1);
      setInputValue(search);
    }
  }

  const tryToOpenPopover = () => {
    if(data) {
      setOpen(true);
      setSelectedIndex(-1);
    }
  }

  useEffect(() => {
    tryToOpenPopover()
  }, [data])

  useEffect(() => {
    if (!inputValue && search) {
      setInputValue(search);
    }
  }, [search, inputValue])
  
  return (
    <div ref={containerRef} className='w-[40vw] relative'>
      <Input 
        className="w-full" 
        id="input" 
        name="search" 
        value={inputValue} 
        onChange={onSearchInputChange} 
        onKeyDown={handleKeyDown} 
        onFocus={tryToOpenPopover} 
      />
      {open && data?.results.length ? (
        <div className='absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-md shadow-lg overflow-y-scroll px-3 py-1'>
          {data.results.map((result, index) => (
            <p 
              key={result.id} 
              data-result={index} 
              className={`my-1 px-2 py-0 hover:bg-gray-100 cursor-pointer !text-base ${
                selectedIndex === index ? 'bg-blue-100' : ''
              }`}
            >
              {result.title}
            </p> 
          ))}
        </div>
      ) : null}
    </div>
  )
}