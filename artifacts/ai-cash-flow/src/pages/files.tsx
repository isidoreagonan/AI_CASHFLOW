import { useState } from "react";
import { useListFiles, useListCourses } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Download, FileVideo, FileCode, FileIcon } from "lucide-react";

const FileTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
    case 'video': return <FileVideo className="w-8 h-8 text-blue-500" />;
    case 'guide': return <FileText className="w-8 h-8 text-primary" />;
    case 'resource': return <FileCode className="w-8 h-8 text-green-500" />;
    default: return <FileIcon className="w-8 h-8 text-muted-foreground" />;
  }
};

export default function Files() {
  const [selectedModuleId, setSelectedModuleId] = useState<number | "all">("all");
  
  const { data: courses, isLoading: isCoursesLoading } = useListCourses();
  const { data: files, isLoading: isFilesLoading } = useListFiles(selectedModuleId !== "all" ? { moduleId: selectedModuleId } : undefined);

  if (isCoursesLoading || isFilesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
          <p className="text-muted-foreground">Download guides, templates, and reference materials.</p>
        </div>

        <div className="w-full md:w-64">
          <Select 
            value={selectedModuleId.toString()} 
            onValueChange={(val) => setSelectedModuleId(val === "all" ? "all" : parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              {courses?.flatMap(course => 
                (course.modules || []).map(module => (
                  <SelectItem key={module.id} value={module.id.toString()}>
                    {course.title.substring(0, 15)}... - {module.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {files && files.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {files.map(file => (
            <Card key={file.id} className="bg-card/40 backdrop-blur hover:bg-card/60 transition-colors border-primary/10 hover:border-primary/30">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                <div className="p-2 bg-background rounded-lg border border-border">
                  <FileTypeIcon type={file.fileType} />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate" title={file.name}>{file.name}</CardTitle>
                  <CardDescription className="text-xs uppercase mt-1">
                    {file.fileType} • {file.fileSize}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                  {file.description}
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" download>
                    <Download className="w-4 h-4 mr-2" /> Download
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed bg-transparent">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileIcon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-1">No resources found</h3>
          <p className="text-muted-foreground text-sm">
            {selectedModuleId === "all" 
              ? "There are no files available in the resource library yet."
              : "There are no files available for this specific module."}
          </p>
        </Card>
      )}
    </div>
  );
}
