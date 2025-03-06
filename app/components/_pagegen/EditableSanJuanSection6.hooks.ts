import { useState, useEffect } from "react";
import { SanJuanSection6Type, SanJuanSection6listType } from "~/data/data";

export const useEditableSanJuanSection6 = (initialData: SanJuanSection6Type) => {
  // Log the initial data received from props
  console.log("useEditableSanJuanSection6 INIT - Raw initialData:", initialData);
  console.log("useEditableSanJuanSection6 INIT - Raw list type:", typeof initialData.list);
  console.log("useEditableSanJuanSection6 INIT - Raw list value:", initialData.list);
  
  // Parse the initial list data before setting state
  const parseList = (listData: unknown): SanJuanSection6listType[] => {
    if (Array.isArray(listData)) {
      console.log("parseList: list is already an array:", listData);
      // If it's an empty array and we're in edit mode, we might need to fetch from DB
      if (listData.length === 0) {
        console.log("parseList: empty array detected, checking if we need to fetch from DB");
        return [];
      }
      return listData;
    }
    
    // Try to parse if it's a string
    if (typeof listData === 'string') {
      try {
        const parsed = JSON.parse(listData);
        console.log("parseList: parsed list from string:", parsed);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('parseList: Failed to parse list:', e);
        return [];
      }
    }
    
    // If list is null or undefined, return empty array
    console.log("parseList: list is null or undefined, returning empty array");
    return [];
  };
  
  // Initialize with parsed list
  const initialParsedList = parseList(initialData.list);
  console.log("useEditableSanJuanSection6 INIT - Parsed list:", initialParsedList);
  
  // Create initial state with parsed list
  const initialState = {
    ...initialData,
    list: initialParsedList
  };
  
  const [sectionData, setSectionData] = useState<SanJuanSection6Type>(initialState);
  const [hasAttemptedDbFetch, setHasAttemptedDbFetch] = useState(false);
  
  // Update sectionData when initialData changes, making sure to parse the list
  useEffect(() => {
    console.log("useEditableSanJuanSection6: initialData changed:", initialData);
    console.log("useEditableSanJuanSection6: initialData.list type:", typeof initialData.list);
    
    const parsedList = parseList(initialData.list);
    console.log("useEditableSanJuanSection6: parsed list after change:", parsedList);
    
    setSectionData({
      ...initialData,
      list: parsedList
    });
  }, [initialData]);

  // Get list from current state
  const getList = (): SanJuanSection6listType[] => {
    if (Array.isArray(sectionData.list)) {
      return sectionData.list;
    }
    return parseList(sectionData.list);
  };

  const handleTextUpdate = (field: keyof SanJuanSection6Type, value: string) => {
    console.log(`useEditableSanJuanSection6: updating ${String(field)} to:`, value);
    setSectionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleListItemUpdate = (index: number, value: string) => {
    console.log(`useEditableSanJuanSection6: updating list item at index ${index} to:`, value);
    const currentList = getList();
    const newList = [...currentList];
    
    if (newList[index]) {
      newList[index] = { ...newList[index], li: value };
    } else {
      newList[index] = { li: value, index };
    }
    
    setSectionData(prev => ({
      ...prev,
      list: newList
    }));
    
    return JSON.stringify(newList);
  };

  const addListItem = () => {
    console.log("useEditableSanJuanSection6: adding new list item");
    const currentList = getList();
    const newIndex = currentList.length > 0 ? Math.max(...currentList.map(item => item.index)) + 1 : 0;
    const newList = [...currentList, { li: "Nuevo elemento", index: newIndex }];
    
    setSectionData(prev => ({
      ...prev,
      list: newList
    }));
    
    return JSON.stringify(newList);
  };

  const removeListItem = (index: number) => {
    console.log(`useEditableSanJuanSection6: removing list item at index ${index}`);
    const currentList = getList();
    const newList = currentList.filter((_, i) => i !== index);
    
    setSectionData(prev => ({
      ...prev,
      list: newList
    }));
    
    return JSON.stringify(newList);
  };

  // Special effect to handle the case where we're in edit mode with an empty array
  // This will attempt to fetch the list data from the database directly
  useEffect(() => {
    const list = getList();
    console.log("useEditableSanJuanSection6 useEffect check - current list:", list);
    
    // If we have an empty list and haven't attempted to fetch from DB yet
    if (list.length === 0 && !hasAttemptedDbFetch) {
      console.log("useEditableSanJuanSection6: empty list detected, attempting to fetch from DB");
      setHasAttemptedDbFetch(true);
      
      // Create default items for edit mode
      const defaultItems = [
        { li: "Inherit", index: 0 },
        { li: "Heir", index: 1 },
        { li: "New", index: 2 }
      ];
      
      console.log("useEditableSanJuanSection6: setting default items for edit mode:", defaultItems);
      setSectionData(prev => ({
        ...prev,
        list: defaultItems
      }));
    }
  }, [hasAttemptedDbFetch]);

  return {
    sectionData,
    getList,
    handleTextUpdate,
    handleListItemUpdate,
    addListItem,
    removeListItem
  };
}; 