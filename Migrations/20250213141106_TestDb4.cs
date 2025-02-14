using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GatherApp.Migrations
{
    /// <inheritdoc />
    public partial class TestDb4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Locations",
                table: "Posts",
                type: "varchar(200)",
                maxLength: 200,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Locations",
                table: "Posts");
        }
    }
}
