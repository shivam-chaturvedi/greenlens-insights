import re

def update_file(filename, process_func):
    with open(filename, 'r') as f:
        content = f.read()
    new_content = process_func(content)
    if new_content != content:
        with open(filename, 'w') as f:
            f.write(new_content)
        print(f"Updated {filename}")
    else:
        print(f"No changes made to {filename}")

def add_import(content, import_str):
    if 'import { Skeleton }' in content or 'Skeleton' in import_str and 'import { Skeleton } from "@/components/ui/skeleton"' in content:
        return content
    # Find last import
    last_import = content.rfind('import ')
    end_of_imports = content.find('\n', last_import) + 1
    return content[:end_of_imports] + import_str + '\n' + content[end_of_imports:]

def process_community(content):
    if 'PostSkeleton' in content: return content
    imports = 'import { Skeleton } from "@/components/ui/skeleton";'
    content = add_import(content, imports)
    
    skeleton_def = """
const PostSkeleton = () => (
  <div className="bg-background border border-border shadow-sm rounded-2xl overflow-hidden p-6 space-y-4">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
    </div>
    <Skeleton className="h-8 w-3/4" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
    <div className="flex gap-4 pt-4 border-t border-border mt-4">
      <Skeleton className="h-4 w-[80px]" />
      <Skeleton className="h-4 w-[80px]" />
      <Skeleton className="h-4 w-[80px]" />
    </div>
  </div>
);
"""
    content = content.replace('const AttachmentPreview', skeleton_def + '\nconst AttachmentPreview')
    
    old_loading = """              {loadingPosts ? (
                <div className="text-center py-12 text-muted-foreground bg-background border border-border">
                  Loading posts…
                </div>
              )"""
    new_loading = """              {loadingPosts ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
                </div>
              )"""
    content = content.replace(old_loading, new_loading)
    return content

def process_journalism(content):
    if 'ArticleSkeleton' in content: return content
    imports = 'import { Skeleton } from "@/components/ui/skeleton";'
    content = add_import(content, imports)
    
    skeleton_def = """
const ArticleSkeleton = () => (
  <div className="bg-background border border-border rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
    <Skeleton className="w-full aspect-video" />
    <div className="p-6 space-y-4 flex flex-col flex-1">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-[80px] rounded-full" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-full flex-1" />
      <div className="pt-4 border-t border-border mt-auto">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  </div>
);
"""
    content = content.replace('const Journalism = () => {', skeleton_def + '\nconst Journalism = () => {')
    
    old_loading = """          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Loading articles...</div>
          )"""
    new_loading = """          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <ArticleSkeleton key={i} />)}
            </div>
          )"""
    content = content.replace(old_loading, new_loading)
    return content

def process_consulting(content):
    if 'ReportSkeleton' in content: return content
    imports = 'import { Skeleton } from "@/components/ui/skeleton";'
    content = add_import(content, imports)
    
    skeleton_def = """
const ReportSkeleton = () => (
  <div className="bg-background border border-border rounded-xl p-6 space-y-4 flex flex-col justify-between shadow-sm">
    <div className="space-y-3">
      <div className="flex justify-between items-start gap-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-8 w-[100px] shrink-0" />
      </div>
      <Skeleton className="h-4 w-1/4" />
    </div>
    <div className="space-y-2 mt-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
    <div className="flex gap-2 mt-4">
      <Skeleton className="h-6 w-[80px] rounded-full" />
      <Skeleton className="h-6 w-[80px] rounded-full" />
    </div>
  </div>
);
"""
    content = content.replace('const Consulting = () => {', skeleton_def + '\nconst Consulting = () => {')
    
    # Needs to match the actual usage of isLoading in Consulting.tsx
    # Let's use regex to replace it
    old_loading = r'\{isLoading \&\& loadingState\}'
    new_loading = r'{isLoading && (\n                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">\n                  {[1, 2, 3, 4, 5, 6].map((i) => <ReportSkeleton key={i} />)}\n                </div>\n              )}'
    content = re.sub(old_loading, new_loading, content)
    return content

update_file('src/pages/Community.tsx', process_community)
update_file('src/pages/Journalism.tsx', process_journalism)
update_file('src/pages/Consulting.tsx', process_consulting)

