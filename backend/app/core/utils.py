import re

def format_phone_number(phone: str) -> str:
    """Format phone number to Rwanda format"""
    
    # Remove all non-digit chars
    digits = re.sub(r'\D', '', phone)

    # Handle different formats
    if digits.startswith('250'):
        return f"+{digits}"
    elif digits.startswith('0') and len(digits) == 10:
        return f"+250{digits[1:]}"
    elif len(digits) == 9:
        return f"+250{digits}"
    
    return phone

def generate_job_slug(title: str, job_id: str) -> str:
    """Generate URL-friendly slug for job posting"""

    # Convert to lowercase and replace spaces with hyphens
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)

    # Append short ID for uniqueness
    short_id = job_id[:8]
    return f"{slug}-{short_id}"
