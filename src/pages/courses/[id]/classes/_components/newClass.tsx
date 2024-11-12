import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaPlus } from "react-icons/fa";

import toast from "react-hot-toast";
import { actions } from "astro:actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const NewClassDialog = ({ courseId }: { courseId: string }) => {
  const [videoLink, setVideoLink] = useState("");
  const [videoType, setVideoType] = useState("DRIVE");
  const [classTitle, setClassTitle] = useState("");
  const [textValue, setTextValue] = useState("Create Class");
  const [folderName, setFolderName] = useState("");
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [createdAt, setCreatedAt] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const { data } = await actions.courses_foldersByCourseId({
          id: courseId!,
        });
        setFolders(data ?? []);
      } catch (error) {
        console.error("Error fetching folders:", error);
        toast.error("Failed to fetch folders");
      }
    };

    fetchFolders();
  }, [courseId]);

  const handleCreateClass = async () => {
    if (!classTitle.trim()) {
      return toast.error("Please fill all necessary fields");
    }

    setTextValue("Creating Class");
    try {
      const { data, error } = await actions.classes_createClass({
        classTitle,
        videoLink,
        videoType: videoType as "DRIVE" | "ZOOM" | "YOUTUBE",
        createdAt,
        folderId: selectedFolder != "new" ? selectedFolder : undefined,
        courseId: courseId!,
        folderName: selectedFolder == "new" ? folderName.trim() : undefined,
      });

      if (error) {
        toast.error("Failed to add new class");
      } else {
        toast.success("Class added successfully");
        setVideoLink("");
        setClassTitle("");
        setSelectedFolder("");
        setFolderName("");
        setIsOpen(false);
        window.location.href = `/courses/${courseId}/class/${data.id}`;
      }
    } catch (error) {
      toast.error("Failed to add new class");
    } finally {
      setTextValue("Create Class");
      window.location.reload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add New Class</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select value={videoType} onValueChange={setVideoType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Video Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRIVE">Drive</SelectItem>
              <SelectItem value="YOUTUBE">YouTube</SelectItem>
              <SelectItem value="ZOOM">Zoom</SelectItem>
            </SelectContent>
          </Select>


          <Input
            type="text"
            placeholder="Enter class title"
            value={classTitle}
            onChange={(e) => setClassTitle(e.target.value)}
          />

          <Input
            type="text"
            placeholder="Enter video link"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
          />


          <Input
            type="date"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
          />

          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger>
              <SelectValue placeholder="Select Folder (Optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New Folder</SelectItem>
              {folders.map((folder: any) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedFolder === "new" && (
            <Input
              type="text"
              placeholder="Enter new folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          )}

          <Button
            disabled={!classTitle || textValue === "Creating Class"}
            className="w-full"
            onClick={handleCreateClass}
          >
            {textValue}
            {textValue === "Creating Class" ? (
              <FaPlus className="ml-2 animate-spin" />
            ) : (
              <FaPlus className="ml-2" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewClassDialog;
