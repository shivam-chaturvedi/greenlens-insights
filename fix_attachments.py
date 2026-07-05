import re

with open('src/pages/Community.tsx', 'r') as f:
    content = f.read()

# Add Carousel imports
imports = """import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
"""
content = content.replace('import ReactQuill from "react-quill";', imports + 'import ReactQuill from "react-quill";')

# Add helper components outside the main Community component
helpers = """
const parseMarkdownBold = (content: string) => {
  if (!content) return "";
  return content.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
};

const AttachmentPreview = ({ attachment }: { attachment: PostAttachment }) => {
  const url = supabase.storage.from(attachment.bucket).getPublicUrl(attachment.path).data.publicUrl;
  if (attachment.mime_type.startsWith("image/")) {
    return <img src={url} alt={attachment.name} className="w-full max-h-[400px] object-contain rounded-lg border border-border bg-muted/20" />;
  }
  if (attachment.mime_type.startsWith("video/")) {
    return <video src={url} controls className="w-full max-h-[400px] rounded-lg border border-border bg-muted/20" />;
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <LinkIcon className="w-5 h-5 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <p className="text-xs text-muted-foreground">{(attachment.size / 1024).toFixed(1)} KB</p>
      </div>
    </a>
  );
};
"""

content = content.replace('const DEFAULT_AUTHOR_NAME = "Community contributor";', helpers + '\nconst DEFAULT_AUTHOR_NAME = "Community contributor";')

# Replace the innerHTML line
old_inner_html = '<div className="text-foreground/80 leading-relaxed prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />'
new_inner_html = '<div className="text-foreground/80 leading-relaxed prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdownBold(post.content) }} />'
content = content.replace(old_inner_html, new_inner_html)

# Insert the attachments viewer right after the post content
attachments_viewer = """                      {post.attachments && post.attachments.length > 0 && (
                        <div className="py-4">
                          {post.attachments.length === 1 ? (
                            <AttachmentPreview attachment={post.attachments[0]} />
                          ) : (
                            <Carousel className="w-full max-w-3xl mx-auto group">
                              <CarouselContent>
                                {post.attachments.map((att, idx) => (
                                  <CarouselItem key={idx}>
                                    <AttachmentPreview attachment={att} />
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                              <div className="hidden group-hover:block transition-opacity">
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                              </div>
                            </Carousel>
                          )}
                        </div>
                      )}"""

content = content.replace(new_inner_html, new_inner_html + '\n' + attachments_viewer)


with open('src/pages/Community.tsx', 'w') as f:
    f.write(content)

