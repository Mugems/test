import { useState } from 'react';
import { Input, Grid } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
const CommonSearch = ({ placeholder, onSearch, loading, size = "large", allowClear = true, onEmptySearch }) => {
  const [searchValue, setSearchValue] = useState("");
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const { Search } = Input;
  const handleSearch = (value) => {
    setSearchValue(value);
    if (value === "") {
      if (onEmptySearch) {
          onEmptySearch();
      }
    } else {
      if (onSearch) {
        onSearch(value);
      }
    }
  }
  return (
    <>
      <div className='row justify-content-between' style={{ marginBottom: screens.xs ? "10px" : "0px" }}>
        <div className='col-md-10'>
          <Search
            placeholder={placeholder}
            allowClear={allowClear}
            enterButton={<SearchOutlined />}
            size={size}
            loading={loading}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}

          >

          </Search>
        </div>
      </div>

    </>
  )
}
export default CommonSearch;