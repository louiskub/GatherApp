using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GatherApp.Migrations
{
    /// <inheritdoc />
    public partial class TestDb16 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Users",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Users",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "Users",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Sex",
                table: "Users",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "ReportType",
                table: "Reports",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ActivityTypeUser",
                columns: table => new
                {
                    ActTypeProfileId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "varchar(36)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityTypeUser", x => new { x.ActTypeProfileId, x.UserId });
                    table.ForeignKey(
                        name: "FK_ActivityTypeUser_ActivityTypes_ActTypeProfileId",
                        column: x => x.ActTypeProfileId,
                        principalTable: "ActivityTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ActivityTypeUser_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "RatingScores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<string>(type: "varchar(36)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RatedUserId = table.Column<string>(type: "varchar(36)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RaterId = table.Column<string>(type: "varchar(36)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Score = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RatingScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RatingScores_Users_RatedUserId",
                        column: x => x.RatedUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RatingScores_Users_RaterId",
                        column: x => x.RaterId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RatingScores_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityTypeUser_UserId",
                table: "ActivityTypeUser",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RatingScores_RatedUserId",
                table: "RatingScores",
                column: "RatedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RatingScores_RaterId",
                table: "RatingScores",
                column: "RaterId");

            migrationBuilder.CreateIndex(
                name: "IX_RatingScores_UserId",
                table: "RatingScores",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActivityTypeUser");

            migrationBuilder.DropTable(
                name: "RatingScores");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Sex",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ReportType",
                table: "Reports");
        }
    }
}
