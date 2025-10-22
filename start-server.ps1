# Script para criar um servidor HTTP simples
$port = 8000
$path = "C:\Users\Farmacia L7\Desktop\Cristiano\Bar_Restaurante"

Write-Host "Iniciando servidor HTTP na porta $port"
Write-Host "Diretório: $path"
Write-Host "URL: http://localhost:$port"

# Usar .NET HttpListener para criar servidor básico
Add-Type -AssemblyName System.Net.Http

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Servidor iniciado! Pressione Ctrl+C para parar."

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") { $localPath = "/index.html" }
        
        $filePath = Join-Path $path $localPath.TrimStart('/')
        
        if (Test-Path $filePath) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $content.Length
            
            # Definir Content-Type baseado na extensão
            $extension = [System.IO.Path]::GetExtension($filePath)
            switch ($extension) {
                ".html" { $response.ContentType = "text/html" }
                ".css" { $response.ContentType = "text/css" }
                ".js" { $response.ContentType = "application/javascript" }
                ".json" { $response.ContentType = "application/json" }
                default { $response.ContentType = "text/plain" }
            }
            
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $response.StatusDescription = "Not Found"
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found")
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        
        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
}