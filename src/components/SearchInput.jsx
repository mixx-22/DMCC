import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  InputGroup,
  Input,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";

const SearchInput = ({ placeholder = "Search...", defaultValue = "" }) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(defaultValue);

  const handleSearch = () => {
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <InputGroup maxW={{ base: "full", md: "400px" }}>
      <Input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        variant="search"
      />
      <InputRightElement>
        <IconButton
          isRound
          icon={<FiSearch />}
          onClick={handleSearch}
          aria-label="Search"
          variant="ghost"
          size="sm"
        />
      </InputRightElement>
    </InputGroup>
  );
};

SearchInput.propTypes = {
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string,
};

export default SearchInput;
