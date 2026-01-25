import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  InputGroup,
  Input,
  IconButton,
  InputLeftElement,
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";

const SearchInput = ({
  header = false,
  placeholder = "Search...",
  defaultValue = "",
  children,
  ...props
}) => {
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
    <InputGroup w="full" {...props}>
      <Input
        value={keyword}
        className={header ? "header" : ""}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        variant="search"
      />
      <InputLeftElement>
        <IconButton
          isRound
          icon={<FiSearch />}
          onClick={handleSearch}
          aria-label="Search"
          variant="ghost"
          size="sm"
        />
      </InputLeftElement>
      {children}
    </InputGroup>
  );
};

SearchInput.propTypes = {
  header: PropTypes.bool,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string,
  children: PropTypes.node,
};

export default SearchInput;
