import * as React from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Check, Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { SanJuanSection6Type } from "~/data/data";
import EditableText from "./EditableText";
import { useEditableSanJuanSection6 } from "./EditableSanJuanSection6.hooks";

type EditableSanJuanSection6Props = {
  width: number;
  data: SanJuanSection6Type;
  onUpdate: (field: keyof SanJuanSection6Type, value: string) => void;
};

const EditableSanJuanSection6: React.FC<EditableSanJuanSection6Props> = ({ 
  width, 
  data,
  onUpdate
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  
  // Add detailed console logs to debug the data
  console.log("EditableSanJuanSection6 RENDER - Raw data:", data);
  console.log("EditableSanJuanSection6 RENDER - List type:", typeof data.list);
  console.log("EditableSanJuanSection6 RENDER - List value:", data.list);
  
  // Track when the component receives new props
  React.useEffect(() => {
    console.log("EditableSanJuanSection6 PROPS CHANGED - data:", data);
    console.log("EditableSanJuanSection6 PROPS CHANGED - list type:", typeof data.list);
    console.log("EditableSanJuanSection6 PROPS CHANGED - list value:", data.list);
    
    // If the list is a string, try to parse it directly
    if (typeof data.list === 'string') {
      try {
        const parsedList = JSON.parse(data.list);
        console.log("EditableSanJuanSection6 PROPS CHANGED - parsed list:", parsedList);
      } catch (e) {
        console.error("EditableSanJuanSection6 PROPS CHANGED - error parsing list:", e);
      }
    } else if (Array.isArray(data.list) && data.list.length === 0) {
      // If the list is an empty array, log it
      console.log("EditableSanJuanSection6 PROPS CHANGED - empty array detected");
      
      // Check if we're in edit mode by looking at the URL
      const isEditMode = window.location.pathname.includes('/admin/dashboard/pagegen/edit/');
      console.log("EditableSanJuanSection6 PROPS CHANGED - isEditMode:", isEditMode);
      
      if (isEditMode) {
        console.log("EditableSanJuanSection6 PROPS CHANGED - in edit mode with empty array, will use default items");
      }
    }
  }, [data]);
  
  // Use the custom hook for state management
  const { 
    sectionData, 
    getList, 
    handleTextUpdate, 
    handleListItemUpdate, 
    addListItem, 
    removeListItem 
  } = useEditableSanJuanSection6(data);
  
  // Get the list items from the hook
  const listItems = getList();
  console.log("EditableSanJuanSection6 RENDER - Processed list items:", listItems);
  
  // Wrapper functions to call both the hook's functions and the parent's onUpdate
  const handleLocalTextUpdate = (field: keyof SanJuanSection6Type) => (value: string) => {
    handleTextUpdate(field, value);
    onUpdate(field, value);
  };
  
  const handleLocalListItemUpdate = (index: number) => (value: string) => {
    console.log(`EditableSanJuanSection6: updating list item at index ${index} to:`, value);
    const newListJson = handleListItemUpdate(index, value);
    console.log("EditableSanJuanSection6: sending updated list to parent:", newListJson);
    onUpdate("list", newListJson);
  };
  
  const handleAddListItem = () => {
    console.log("EditableSanJuanSection6: adding new list item");
    const newListJson = addListItem();
    console.log("EditableSanJuanSection6: sending updated list to parent after add:", newListJson);
    onUpdate("list", newListJson);
  };
  
  const handleRemoveListItem = (index: number) => {
    console.log(`EditableSanJuanSection6: removing list item at index ${index}`);
    const newListJson = removeListItem(index);
    console.log("EditableSanJuanSection6: sending updated list to parent after remove:", newListJson);
    onUpdate("list", newListJson);
  };

  return (
    <div className="w-full overflow-x-hidden">
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? 
          { opacity: 1, y: 0 } : 
          { opacity: 0, y: 50 }
        }
        transition={{ duration: 0.8 }}
        className="w-full flex flex-col items-center justify-center relative z-[1] mb-24"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? 
            { opacity: 1, scale: 1 } : 
            { opacity: 0, scale: 0.95 }
          }
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.5 }}
          className="w-[95%] max-w-[600px] mx-auto px-4"
        >
          <Card className="backdrop-blur-md bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-col justify-center items-center space-y-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={isInView ? 
                  { opacity: 1, y: 0 } : 
                  { opacity: 0, y: -20 }
                }
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CardTitle className={`
                  text-center bg-gradient-to-r from-blue-900 to-blue-600 
                  bg-clip-text text-transparent font-bold
                  ${width <= 350 ? "text-[1.5rem]" : "text-[2rem]"}
                `}>
                  <EditableText
                    value={sectionData.cardTitle}
                    onUpdate={handleLocalTextUpdate("cardTitle")}
                    className="text-transparent"
                  />
                </CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? 
                  { opacity: 1, y: 0 } : 
                  { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CardDescription className={`
                  text-center text-blue-800/80
                  ${width <= 350 ? "text-[1rem]" : "text-[1.2rem]"}
                `}>
                  <EditableText
                    value={sectionData.cardDescription}
                    onUpdate={handleLocalTextUpdate("cardDescription")}
                    className="text-blue-800/80"
                  />
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className={`${width <= 350 ? "px-4" : "px-8"}`}>
              <motion.h4
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? 
                  { opacity: 1, x: 0 } : 
                  { opacity: 0, x: -20 }
                }
                transition={{ duration: 0.5, delay: 0.4 }}
                className="font-semibold text-blue-900 text-xl mb-6"
              >
                <EditableText
                  value={sectionData.firstH4}
                  onUpdate={handleLocalTextUpdate("firstH4")}
                  className="text-blue-900"
                />
              </motion.h4>
              <ul className={`flex flex-col gap-6 mt-2 ${
                width < 350 ? "ml-0 text-[0.9rem]" : 
                width < 500 ? "ml-2 text-[0.9rem]" : 
                "ml-6"
              }`}>
                {listItems && listItems.length > 0 ? (
                  listItems.map((li, index) => (
                    <motion.li 
                      key={li.index || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? 
                        { opacity: 1, x: 0 } : 
                        { opacity: 0, x: -20 }
                      }
                      transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                      whileHover={{ x: 10 }}
                      className="flex flex-row items-start justify-start gap-4 group" 
                    >
                      <motion.div 
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-full p-2 bg-blue-100 group-hover:bg-blue-200 transition-colors"
                      >
                        <Check className="h-5 w-5 text-blue-700" />
                      </motion.div>
                      <div className="flex-1">
                        <EditableText
                          value={li.li}
                          onUpdate={handleLocalListItemUpdate(index)}
                          className="text-blue-800/90 leading-relaxed pt-1"
                        />
                      </div>
                      <button 
                        onClick={() => handleRemoveListItem(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:text-red-700"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.li>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No list items found. Add one below.
                  </div>
                )}
                
                {/* Add new item button */}
                <motion.li
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + ((listItems?.length || 0) * 0.1) }}
                  className="flex justify-center mt-2"
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddListItem}
                    className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Añadir elemento</span>
                  </Button>
                </motion.li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col justify-center items-center gap-8 p-8 bg-gradient-to-b from-transparent to-blue-50/50">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? 
                  { opacity: 1, scale: 1 } : 
                  { opacity: 0, scale: 0.9 }
                }
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-center"
              >
                <motion.h4 
                  whileHover={{ scale: 1.05 }}
                  className={`
                    font-extrabold tracking-wider text-blue-900
                    ${width <= 350 ? "text-4xl" : "text-5xl"}
                  `}
                >
                  <EditableText
                    value={sectionData.secondH4}
                    onUpdate={handleLocalTextUpdate("secondH4")}
                    className="text-blue-900"
                  />
                </motion.h4>
                <span className="text-sm font-medium text-blue-600 mt-2 block">
                  <EditableText
                    value={sectionData.secondH4span}
                    onUpdate={handleLocalTextUpdate("secondH4span")}
                    className="text-blue-600"
                  />
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? 
                  { opacity: 1, y: 0 } : 
                  { opacity: 0, y: 20 }
                }
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <Button className={`
                  bg-blue-800 hover:bg-blue-700 text-white rounded-full 
                  shadow-lg hover:shadow-xl transition-all duration-300
                  ${width <= 350 ? "px-6 py-5 text-base" : "px-8 py-6 text-lg"}
                `}>
                  <EditableText
                    value={sectionData.button}
                    onUpdate={handleLocalTextUpdate("button")}
                    className="text-white"
                  />
                </Button>
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EditableSanJuanSection6;
