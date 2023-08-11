import { useEffect, useState } from 'react';
import { at } from 'lodash';
import { useField } from 'formik';
import {
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Box,
} from '@mui/material';
import axios from '../../api/axios';
import { MenuForm } from '../MenuForm';
import { useConfirm } from 'material-ui-confirm';

export function SelectMenuField(props) {
  const { label, url, ...rest } = props;

  const [initialData, setInitialData] = useState([]);
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const response = await axios.get(url);
        setInitialData(response.data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchInitialData();
  }, [url]);

  const [menuOptions, setMenuOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');

  const [field, meta] = useField(props);
  const { value: selectedValue } = field;
  const [touched, error] = at(meta, 'touched', 'error');
  const isError = touched && error && true;

  //const confirm = useConfirm();

  useEffect(() => {
    setMenuOptions(initialData || []);
  }, [initialData]);

  function _renderHelperText() {
    if (isError) {
      return <FormHelperText>{error}</FormHelperText>;
    }
  }

  const addOption = async (newOption, isEditing) => {
    try {
      if (isEditing) {
        await axios.put(`${url}/${selectedOption.id}`, {
          name: newOption,
        });
        const updatedMenuOptions = menuOptions.map((option) =>
          option.id === selectedOption.id
            ? { ...option, name: newOption }
            : option
        );
        const optionFind = updatedMenuOptions.find(
          (option) => option.id === selectedOption.id
        );
        setMenuOptions(updatedMenuOptions);
        setSelectedOption(optionFind);
      } else {
        const res = await axios.post(url, {
          name: newOption,
        });
        const newMenuOptions = [
          ...menuOptions,
          { name: newOption, id: res.data.insertId },
        ];
        setMenuOptions(newMenuOptions);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* const deleteOption = async () => {
    try {
      await confirm({
        description: `El ${label} ${selectedOption.nombre} se eliminará permanentemente.`,
      });
      await axios.delete(`${url}/${selectedOption.id}`);
      const newMenuOptions = menuOptions.filter(
        (option) => option.id !== selectedOption.id
      );

      setMenuOptions(newMenuOptions);
      setSelectedOption(null);
    } catch (error) {
      console.log('Deletion cancelled.');
    }
  }; */

  return (
    <FormControl {...rest} error={isError}>
      <InputLabel>{label}</InputLabel>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Select
          label={label}
          {...field}
          value={
            selectedValue &&
            menuOptions.some((option) => option.id === selectedValue)
              ? selectedValue
              : ''
          }
          onChange={(e) => {
            field.onChange(e);
            const dataFind = menuOptions.find((el) => el.id === e.target.value);
            setSelectedOption(dataFind);
          }}
          fullWidth
        >
          {menuOptions.map((el) => (
            <MenuItem value={el.id} key={el.id}>
              {el.name}
            </MenuItem>
          ))}
        </Select>
        <MenuForm
          label={label}
          selectedOption={selectedOption}
          addOption={addOption}
          //deleteOption={deleteOption}
        />
      </Box>
      {_renderHelperText()}
    </FormControl>
  );
}

/* SelectMenuField.defaultProps = {
  data: [],
};

SelectMenuField.propTypes = {
  data: PropTypes.array.isRequired,
}; */

//export default SelectMenuField;
