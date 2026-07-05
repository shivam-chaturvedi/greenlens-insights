with open('src/pages/Community.tsx', 'r') as f:
    content = f.read()

content = content.replace('catch (err: any) {\n      toast({ title: "Update failed", description: err.message, variant: "destructive" });', 'catch (err: unknown) {\n      const message = err instanceof Error ? err.message : "An unknown error occurred";\n      toast({ title: "Update failed", description: message, variant: "destructive" });')
content = content.replace('catch (err: any) {\n      toast({ title: "Delete failed", description: err.message, variant: "destructive" });', 'catch (err: unknown) {\n      const message = err instanceof Error ? err.message : "An unknown error occurred";\n      toast({ title: "Delete failed", description: message, variant: "destructive" });')

with open('src/pages/Community.tsx', 'w') as f:
    f.write(content)

