use std::net::TcpListener;
use std::io::{Read, Write};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:3000").unwrap();
    println!("Server running on http://127.0.0.1:3000\nNavigate to the links to view the gallery.");

    for stream in listener.incoming() {
        if let Ok(mut stream) = stream {
            let mut buffer = [0; 1024];
            let _ = stream.read(&mut buffer);
            
            let request = String::from_utf8_lossy(&buffer[..]);
            let path = request.lines().next().unwrap_or("").split_whitespace().nth(1).unwrap_or("/");

            let (status_line, content) = match path {
                "/" | "" => ("HTTP/1.1 200 OK", include_str!("../../gallery_home_with_interactive_map/code.html")),
                "/discovery" => ("HTTP/1.1 200 OK", include_str!("../../photo_discovery_and_details/code.html")),
                "/upload" => ("HTTP/1.1 200 OK", include_str!("../../upload_your_photography/code.html")),
                _ => ("HTTP/1.1 404 NOT FOUND", "404 Not Found"),
            };

            let response = format!(
                "{}\r\nContent-Length: {}\r\nContent-Type: text/html\r\n\r\n{}",
                status_line,
                content.len(),
                content
            );
            
            let _ = stream.write_all(response.as_bytes());
            let _ = stream.flush();
        }
    }
}
